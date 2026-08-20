const BASE = "http://localhost:3000";
let failures = 0;

function assert(cond, label, extra = "") {
  if (!cond) {
    failures++;
    console.error(`FAIL ${label} ${extra}`);
  } else {
    console.log(`PASS ${label}`);
  }
}

async function api(path, { method = "GET", body, cookie } = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  let json = null;
  try { json = await res.json(); } catch {}
  return { status: res.status, json, setCookie: res.headers.get("set-cookie") };
}

async function login(email) {
  const res = await api("/api/auth/login", {
    method: "POST",
    body: { email, password: "TestPass123!" },
  });
  return res.setCookie;
}

async function loadAchievements(cookie) {
  const r = await api("/api/achievements", { cookie });
  return r.json.data;
}

async function main() {
  const adminCookie = await login("flow-admin@test.local");
  assert(adminCookie, "admin login");

  const depts = (await api("/api/departments", { cookie: adminCookie })).json.data;
  assert(Array.isArray(depts) && depts.length > 0, "admin can list departments");

  // ── 0. Member registers via the PUBLIC route
  let r = await api("/api/auth/register", {
    method: "POST",
    body: {
      fullName: "Flow Member",
      email: "flow-member@test.local",
      password: "TestPass123!",
      departmentId: depts[0].id,
      motivation: "I want to change the world.",
    },
  });
  assert(r.status === 201, "public registration creates PENDING member", `got ${r.status} ${JSON.stringify(r.json)}`);

  const dupBody = {
    fullName: "Flow Member",
    email: "flow-member@test.local",
    password: "TestPass123!",
    departmentId: depts[0].id,
    motivation: "I want to change the world.",
  };
  r = await api("/api/auth/register", { method: "POST", body: dupBody });
  assert(r.status === 409, "duplicate registration rejected", `got ${r.status}`);

  const memberLogin = await api("/api/auth/login", {
    method: "POST",
    body: { email: "flow-member@test.local", password: "TestPass123!" },
  });
  assert(memberLogin.status === 403, "PENDING member cannot log in yet", `got ${memberLogin.status}`);

  // ── 1. Admin approves the application
  const users = (await api("/api/users?status=ALL", { cookie: adminCookie })).json.data.users;
  const member = users.find((u) => u.email === "flow-member@test.local");
  assert(member, "admin sees the new pending member");

  r = await api("/api/users", { method: "PATCH", body: { userId: member.id, status: "APPROVED" }, cookie: adminCookie });
  assert(r.status === 200, "admin approves member", `got ${r.status}`);
  const allocatedMemberId = r.json.data?.memberId;
  assert(typeof allocatedMemberId === "string" && allocatedMemberId.startsWith("EN-ISIMG-"), "approval auto-assigns member ID", JSON.stringify(r.json.data));

  const memberCookie = await login("flow-member@test.local");
  assert(memberCookie, "member can log in after approval");

  r = await api("/api/member/dashboard", { cookie: memberCookie });
  assert(r.status === 200 && r.json.data.stats.unreadNotifications >= 1, "dashboard shows welcome notification", JSON.stringify(r.json.data?.stats));
  assert(r.json.data.user.memberId === allocatedMemberId, "dashboard echoes member ID", `got ${r.json.data.user?.memberId}`);
  assert(r.json.data.stats.achievementsCount === 0 && r.json.data.stats.certificatesCount === 0, "dashboard counts come from DB (0 initially)", `ach=${r.json.data.stats.achievementsCount} cert=${r.json.data.stats.certificatesCount}`);
  assert(typeof r.json.data.stats.engagement?.score === "number", "dashboard computes engagement score", JSON.stringify(r.json.data.stats.engagement));

  // ── Security: anonymous + member access control
  for (const [path, label] of [["/api/stats", "anonymous blocked from stats"], ["/api/certificates", "anonymous blocked from certificates"], ["/api/member/dashboard", "anonymous blocked from dashboard"]]) {
    r = await api(path);
    assert(r.status === 401, label, `got ${r.status}`);
  }
  r = await api("/api/achievements", { method: "POST", body: { name: "x", description: "y" }, cookie: memberCookie });
  assert(r.status === 403, "member cannot create achievements", `got ${r.status}`);
  r = await api("/api/certificates", { method: "POST", body: { userId: member.id, title: "x" }, cookie: memberCookie });
  assert(r.status === 403, "member cannot issue certificates", `got ${r.status}`);
  r = await api("/api/notifications/announce", { method: "POST", body: { title: "x" }, cookie: memberCookie });
  assert(r.status === 403, "member cannot announce", `got ${r.status}`);
  r = await api("/api/users", { method: "PATCH", body: { userId: member.id, points: 9999 }, cookie: memberCookie });
  assert(r.status === 403, "member cannot award themselves XP", `got ${r.status}`);
  r = await api("/api/missions", { method: "POST", body: { userId: member.id, text: "x", points: 10 }, cookie: memberCookie });
  assert(r.status === 403, "member cannot assign missions", `got ${r.status}`);

  // ── 2. Admin creates a published future event (self-contained)
  const future = new Date(Date.now() + 7 * 86400000).toISOString();
  r = await api("/api/events", { method: "POST", body: { title: "Flow Test Event", description: "E2E", date: future, location: "Room A", published: true }, cookie: adminCookie });
  assert(r.status === 201, "admin creates published event", `got ${r.status} ${JSON.stringify(r.json)}`);
  const event = r.json.data;

  // ── 3. Missions: automatic achievement evaluation
  const missionIds = [];
  for (let i = 1; i <= 2; i++) {
    r = await api("/api/missions", { method: "POST", body: { userId: member.id, text: `Flow mission ${i}`, points: 60 }, cookie: adminCookie });
    assert(r.status === 201, `admin creates mission ${i}`, `got ${r.status} ${JSON.stringify(r.json)}`);
    missionIds.push(r.json.data.id);

    r = await api(`/api/missions/${missionIds[i - 1]}`, { method: "PATCH", body: { workLink: "https://example.com/work" }, cookie: memberCookie });
    assert(r.status === 200 && r.json.data.status === "PENDING_REVIEW", `member submits mission ${i}`, `got ${r.status} ${JSON.stringify(r.json)}`);

    r = await api(`/api/missions/${missionIds[i - 1]}`, { method: "PATCH", body: { status: "APPROVED" }, cookie: adminCookie });
    assert(r.status === 200 && r.json.data.pointsAwarded === true, `admin approves mission ${i}`, `got ${r.status} ${JSON.stringify(r.json)}`);
  }

  let ach = await loadAchievements(memberCookie);
  const firstMission = ach.find((a) => a.name === "Flow First Mission");
  const xpMilestone = ach.find((a) => a.name === "Flow XP Milestone");
  assert(firstMission?.earned === true, "First Mission achievement auto-unlocked", JSON.stringify(firstMission));
  assert(xpMilestone?.earned === true, "XP Milestone auto-unlocked (2x60 = 120 XP)", JSON.stringify(xpMilestone));

  r = await api("/api/member/dashboard", { cookie: memberCookie });
  assert(r.json.data.stats.missionsCompleted === 2, "missionsCompleted counted from DB", `got ${r.json.data.stats.missionsCompleted}`);
  assert(r.json.data.user.points === 220, "XP = 120 missions + 100 milestone badge", `got ${r.json.data.user.points}`);
  assert(r.json.data.stats.achievementsCount === 2, "achievementsCount from DB (2)", `got ${r.json.data.stats.achievementsCount}`);

  // ── 4. Manual award + duplicate prevention
  ach = await loadAchievements(adminCookie);
  const manualBadge = ach.find((a) => a.name === "Flow Manual Badge");
  r = await api(`/api/achievements/${manualBadge.id}/award`, { method: "POST", body: { userId: member.id }, cookie: adminCookie });
  assert(r.status === 200, "admin awards manual badge", `got ${r.status}`);
  r = await api(`/api/achievements/${manualBadge.id}/award`, { method: "POST", body: { userId: member.id }, cookie: adminCookie });
  assert(r.status === 409, "duplicate award prevented", `got ${r.status}`);
  r = await api(`/api/achievements/${manualBadge.id}/award`, { method: "POST", body: { userId: member.id }, cookie: memberCookie });
  assert(r.status === 403, "member cannot award achievements", `got ${r.status}`);

  // ── 5. Certificate flow
  r = await api("/api/certificates", { method: "POST", body: { userId: member.id, title: "Flow Participation", description: "E2E certificate", eventId: event.id, achievementId: firstMission.id }, cookie: adminCookie });
  assert(r.status === 201, "admin issues certificate", `got ${r.status} ${JSON.stringify(r.json)}`);
  const certNumber = r.json.data.certificateNumber;
  assert(/^ENIMG-\d{4}-[A-Z2-9]{6}$/.test(certNumber), "certificate number follows unique format", certNumber);

  r = await api("/api/certificates", { cookie: memberCookie });
  assert(r.json.data.length === 1 && r.json.data[0].certificateNumber === certNumber, "member sees the certificate");

  r = await api("/api/member/dashboard", { cookie: memberCookie });
  assert(r.json.data.stats.certificatesCount === 1, "certificatesCount from DB (1)", `got ${r.json.data.stats.certificatesCount}`);

  const certId = r.json.data.stats.certificatesCount && (await api("/api/certificates", { cookie: memberCookie })).json.data[0].id;
  r = await api(`/api/certificates/${certId}`, { method: "DELETE", cookie: adminCookie });
  assert(r.status === 200, "admin revokes certificate", `got ${r.status}`);
  r = await api("/api/certificates", { cookie: memberCookie });
  assert(r.json.data.length === 0, "revoked certificate hidden from member");

  // ── 6. Event registration + attendance
  r = await api(`/api/events/${event.id}/register`, { method: "POST", cookie: memberCookie });
  assert(r.status === 201, "member registers for event", `got ${r.status} ${JSON.stringify(r.json)}`);
  r = await api(`/api/events/${event.id}/register`, { method: "POST", cookie: memberCookie });
  assert(r.status === 409, "duplicate registration prevented", `got ${r.status}`);

  r = await api("/api/events/mine", { cookie: memberCookie });
  assert(r.json.data.some((reg) => reg.event.id === event.id && reg.status === "REGISTERED"), "member sees their registration");

  r = await api(`/api/events/${event.id}/attendance`, { method: "POST", body: { userId: member.id, status: "ATTENDED" }, cookie: adminCookie });
  assert(r.status === 200, "admin marks attendance", `got ${r.status} ${JSON.stringify(r.json)}`);
  r = await api(`/api/events/${event.id}/attendance`, { method: "POST", body: { userId: member.id, status: "ATTENDED" }, cookie: adminCookie });
  assert(r.status === 409, "duplicate attendance prevented", `got ${r.status}`);
  r = await api(`/api/events/${event.id}/attendance`, { method: "POST", body: { userId: member.id, status: "ATTENDED" }, cookie: memberCookie });
  assert(r.status === 403, "member cannot mark attendance", `got ${r.status}`);
  r = await api(`/api/events/${event.id}/attendance`, { cookie: memberCookie });
  assert(r.status === 403, "member cannot view roster", `got ${r.status}`);

  r = await api("/api/events/mine", { cookie: memberCookie });
  assert(r.json.data[0].status === "ATTENDED", "member sees attendance status");

  ach = await loadAchievements(memberCookie);
  const eventGoer = ach.find((a) => a.name === "Flow Event Goer");
  assert(eventGoer?.earned === true, "Event Goer unlocked by attendance", JSON.stringify(eventGoer));

  r = await api("/api/member/dashboard", { cookie: memberCookie });
  assert(r.json.data.stats.eventsAttended === 1, "eventsAttended counted from DB", `got ${r.json.data.stats.eventsAttended}`);

  // ── 7. Project membership flow
  const projects = (await api("/api/projects", { cookie: adminCookie })).json.data;
  const project = projects.find((p) => p.published) ?? projects[0];
  assert(project, "found a project");
  if (!project) return;

  r = await api(`/api/projects/${project.id}/join`, { method: "POST", cookie: memberCookie });
  assert(r.status === 201, "member requests to join project", `got ${r.status} ${JSON.stringify(r.json)}`);
  r = await api(`/api/projects/${project.id}/join`, { method: "POST", cookie: memberCookie });
  assert(r.status === 409, "duplicate join request prevented", `got ${r.status}`);

  r = await api(`/api/projects/${project.id}/members`, { cookie: adminCookie });
  const pendingReq = r.json.data.find((m) => m.user.id === member.id && m.status === "PENDING");
  assert(pendingReq, "admin sees pending request");

  r = await api(`/api/projects/${project.id}/members/${pendingReq.id}`, { method: "PATCH", body: { status: "APPROVED", role: "Content" }, cookie: adminCookie });
  assert(r.status === 200 && r.json.data.status === "APPROVED", "admin approves membership", `got ${r.status} ${JSON.stringify(r.json)}`);

  r = await api(`/api/projects/${project.id}/members`, { cookie: memberCookie });
  assert(r.json.data?.status === "APPROVED" && r.json.data.role === "Content", "member sees only their own membership (IDOR-safe)");

  ach = await loadAchievements(memberCookie);
  const projectBuilder = ach.find((a) => a.name === "Flow Project Builder");
  assert(projectBuilder?.earned === true, "Project Builder unlocked by membership", JSON.stringify(projectBuilder));

  r = await api("/api/member/dashboard", { cookie: memberCookie });
  assert(r.json.data.stats.projectsCount === 1, "projectsCount counted from DB", `got ${r.json.data.stats.projectsCount}`);

  r = await api(`/api/projects/${project.id}/members`, { method: "DELETE", cookie: memberCookie });
  assert(r.status === 403, "member cannot manipulate the roster", `got ${r.status}`);

  const approvedMembership = (await api(`/api/projects/${project.id}/members`, { cookie: adminCookie })).json.data.find((m) => m.user.id === member.id);
  r = await api(`/api/projects/${project.id}/members/${approvedMembership.id}`, { method: "DELETE", cookie: adminCookie });
  assert(r.status === 200, "admin removes member, notification created", `got ${r.status}`);

  r = await api(`/api/projects/${project.id}/join`, { method: "POST", cookie: memberCookie });
  assert(r.status === 201, "member can re-request after removal", `got ${r.status}`);
  r = await api(`/api/projects/${project.id}/join`, { method: "DELETE", cookie: memberCookie });
  assert(r.status === 200, "member cancels their pending request", `got ${r.status}`);

  // ── 8. Notification lifecycle
  r = await api("/api/notifications", { cookie: memberCookie });
  const notifs = r.json.data.notifications;
  const unreadBefore = r.json.data.unreadCount;
  assert(unreadBefore >= 1 && notifs.length >= 1, "notifications list + unread count from DB", `unread=${unreadBefore} total=${notifs.length}`);
  const linkNotif = notifs.find((n) => n.link);
  if (linkNotif) assert(linkNotif.link.startsWith("/member"), "notification carries a useful link", linkNotif.link);

  const firstId = notifs[0].id;
  r = await api(`/api/notifications/${firstId}`, { method: "PATCH", body: { read: true }, cookie: memberCookie });
  assert(r.status === 200 && r.json.data.read === true, "member marks own notification read");
  r = await api(`/api/notifications/${firstId}`, { method: "PATCH", body: { read: true }, cookie: adminCookie });
  assert(r.status === 403, "IDOR: admin cannot touch member's notification", `got ${r.status}`);

  r = await api("/api/notifications", { method: "POST", cookie: memberCookie });
  assert(r.status === 200, "mark all read");
  r = await api("/api/notifications", { cookie: memberCookie });
  assert(r.json.data.unreadCount === 0, "unread count drops to 0");

  r = await api("/api/notifications/announce", { method: "POST", body: { title: "Flow Announcement", message: "All hands on deck!", link: "/member" }, cookie: adminCookie });
  assert(r.status === 200 && r.json.data.sent >= 1, "announcement broadcast", JSON.stringify(r.json.data));
  r = await api("/api/notifications", { cookie: memberCookie });
  assert(r.json.data.notifications.some((n) => n.title === "Flow Announcement"), "member received the broadcast");
  assert(r.json.data.unreadCount === 1, "unread count reflects the broadcast", `got ${r.json.data.unreadCount}`);

  // ── 9. Admin stats include the new systems
  r = await api("/api/stats", { cookie: adminCookie });
  const s = r.json.data;
  assert(
    typeof s.achievements === "number" && typeof s.achievementsEarned === "number" &&
    typeof s.certificates === "number" && typeof s.eventAttendance === "number" &&
    typeof s.projectMemberships === "number" && typeof s.unreadNotifications === "number",
    "admin stats expose all new system counts",
    JSON.stringify(s),
  );

  // ── 10. Achievement revoke
  ach = await loadAchievements(memberCookie);
  const eventGoerId = ach.find((a) => a.name === "Flow Event Goer").id;
  r = await api(`/api/achievements/${eventGoerId}/revoke`, { method: "POST", body: { userId: member.id }, cookie: adminCookie });
  assert(r.status === 200, "admin revokes achievement", `got ${r.status} ${JSON.stringify(r.json)}`);
  ach = await loadAchievements(memberCookie);
  assert(ach.find((a) => a.name === "Flow Event Goer")?.earned === false, "revoked achievement no longer earned");
  r = await api(`/api/achievements/${eventGoerId}/revoke`, { method: "POST", body: { userId: member.id }, cookie: adminCookie });
  assert(r.status === 404, "double revoke rejected", `got ${r.status}`);

  console.log(failures ? `\nFLOW_TESTS: ${failures} FAILURE(S)` : "\nFLOW_TESTS: ALL PASSED");
  process.exitCode = failures ? 1 : 0;
}

main().catch((e) => { console.error(e); process.exit(1); });