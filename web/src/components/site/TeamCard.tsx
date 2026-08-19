import Image from "next/image";

export function TeamCard({
  member,
}: {
  member: {
    name: string;
    role: string;
    image: string | null;
  };
}) {
  return (
    <div className="group text-center">
      <div className="mb-4 aspect-square overflow-hidden rounded-[2rem] border-2 border-transparent transition-all duration-300 group-hover:border-brand-yellow group-hover:shadow-lg">
        <Image
          src={
            member.image?.startsWith("http")
              ? member.image
              : member.image || "/images/logo.jpg"
          }
          alt={member.name}
          width={240}
          height={240}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <p className="truncate px-1 font-heading text-sm font-black uppercase tracking-wide">
        {member.name}
      </p>
      <p className="mt-0.5 truncate px-1 text-[9px] font-bold uppercase tracking-widest text-gray-400">
        {member.role}
      </p>
    </div>
  );
}