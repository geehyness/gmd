import { client, urlForImage } from '@/lib/sanity';
import { groq } from 'next-sanity';
import { Metadata } from 'next';
import { Project } from '@/types/sanity';
import ProjectsPageClient from './ProjectsPageClient';

export const metadata: Metadata = {
    title: 'Godliness Dongorere - Projects',
    description: 'Explore the portfolio of projects by Godliness Dongorere, showcasing our expertise in various software development fields.',
};

async function getProjectsData(): Promise<Project[]> {
    const query = groq`
    *[_type == "project"] | order(projectDate desc, _createdAt desc){
      _id,
      title,
      slug,
      tagline,
      mainImage,
      technologiesUsed,
      projectDate,
      'projectLink': projectLink,
    }
  `;
    try {
        const data = await client.fetch(query, {}, { next: { revalidate: 60 } });
        const processedProjects = data.map((project: Project) => ({
            ...project,
            imageUrl: project.mainImage ? urlForImage(project.mainImage).url() : undefined,
        }));
        return processedProjects;
    } catch (error) {
        console.error("Failed to fetch project data:", error);
        return [];
    }
}

export default async function Page() {
    const projects = await getProjectsData();

    return (
        <ProjectsPageClient projects={projects} />
    );
}