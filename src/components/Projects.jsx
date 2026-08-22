import React, { useState } from 'react';
import { ExternalLink, MessageCircle, Eye, X } from 'lucide-react';
import { projects } from '../data/projects';
import { socialLinks } from '../data/socialLinks';

const Projects = () => {
  const [filter, setFilter] = useState('All');
  const [lightboxImage, setLightboxImage] = useState(null);

  const categories = ['All', 'Brand Design', 'Web Design', 'Content Creation', 'Data Entry'];

  const filteredProjects = filter === 'All'
    ? projects
    : projects.filter(p => p.category === filter);

  const getWhatsAppMessage = (projectName) => {
    return encodeURIComponent(`Hello SmartOrbit Freelancers, I am interested in discussing a project similar to "${projectName}".`);
  };

  // Check if a project is a poster/image-only project (no external link)
  const isImageProject = (project) => {
    return project.projectUrl === '#' && project.image.startsWith('/assets/');
  };

  const handleViewClick = (e, project) => {
    if (isImageProject(project)) {
      e.preventDefault();
      setLightboxImage({ src: project.image, title: project.title });
    }
  };

  return (
    <section id="projects" className="projects-section">
      <div className="container">
        <div className="section-header animate-fade-in">
          <h2 className="section-title">Our Demo Projects</h2>
          <p className="section-subtitle">Explore examples of what we can create for your business.</p>
        </div>

        <div className="project-filters">
          {categories.map(category => (
            <button
              key={category}
              className={`filter-btn ${filter === category ? 'active' : ''}`}
              onClick={() => setFilter(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="projects-grid">
          {filteredProjects.map((project) => (
            <div key={project.id} className="project-card glass-card animate-fade-in">
              <div className="project-image-wrapper">
                <img
                  src={project.image}
                  alt={project.title}
                  className="project-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22800%22%20height%3D%22600%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%231a2639%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20font-family%3D%22sans-serif%22%20font-size%3D%2224%22%20fill%3D%22%23fff%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3EDemo%20Project%20Image%3C%2Ftext%3E%3C%2Fsvg%3E";
                  }}
                />
                <div className="project-category-badge">{project.category}</div>
              </div>

              <div className="project-content">
                <h3 className="project-title">{project.title}</h3>
                <p className="project-desc">{project.description}</p>

                <div className="project-tech">
                  {project.technologies.map(tech => (
                    <span key={tech} className="tech-tag">{tech}</span>
                  ))}
                </div>

                <div className="project-actions">
                  {isImageProject(project) ? (
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={(e) => handleViewClick(e, project)}
                    >
                      View Poster <Eye size={16} />
                    </button>
                  ) : (
                    <a
                      href={project.projectUrl}
                      target={project.projectUrl.startsWith('#') ? '_self' : '_blank'}
                      rel="noopener noreferrer"
                      className="btn btn-secondary btn-sm"
                    >
                      View Project <ExternalLink size={16} />
                    </a>
                  )}
                  <a
                    href={`${socialLinks.whatsapp}?text=${getWhatsAppMessage(project.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-sm"
                  >
                    Discuss <MessageCircle size={16} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Image Lightbox Modal */}
      {lightboxImage && (
        <div className="lightbox-overlay" onClick={() => setLightboxImage(null)}>
          <button className="lightbox-close" onClick={() => setLightboxImage(null)}>
            <X size={24} />
          </button>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img src={lightboxImage.src} alt={lightboxImage.title} className="lightbox-image" />
            <p className="lightbox-caption">{lightboxImage.title}</p>
          </div>
        </div>
      )}
    </section>
  );
};

export default Projects;
