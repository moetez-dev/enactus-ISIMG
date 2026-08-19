import Link from "next/link";
import Image from "next/image";

export function ProjectCard({
  project,
  description,
}: {
  project: {
    name: string;
    slug: string;
    tag: string;
    image: string | null;
  };
  description?: string;
}) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group block cursor-pointer"
      aria-label={`View ${project.name} project details`}
    >
      <div className="relative h-[420px] overflow-hidden rounded-[3rem] bg-gray-100 shadow-xl">
        <Image
          src={project.image || "/images/logo.jpg"}
          alt={project.name}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/85 via-black/20 to-transparent p-10">
          <div>
            <span className="mb-3 inline-block rounded-full bg-brand-yellow px-4 py-1.5 text-[9px] font-black uppercase tracking-widest text-brand-black">
              {project.tag}
            </span>
            <h3 className="font-heading text-3xl font-black uppercase text-white">
              {project.name}
            </h3>
            {description ? (
              <p className="mt-1 text-sm font-medium text-white/60">
                {description}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  );
}