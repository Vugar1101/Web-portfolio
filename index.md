---
# Feel free to add content and custom Front Matter to this file.
# To modify the layout, see https://jekyllrb.com/docs/themes/#overriding-theme-defaults

layout: home
title: Home
permalink: /home/
---

<section class="home-hero" data-reveal>
  <img class="home-hero__photo" src="{{ '/assets/img/portrait.jpg' | relative_url }}" alt="Portrait of Vugar Mirza" loading="eager" decoding="async" />
  <div class="home-hero__content">
    <h1>Hi, I’m Vugar Mirza</h1>
    <p>
      Software engineering student and aspiring product engineer focused on
      blending thoughtful UX with robust, scalable code. I enjoy translating
      ambiguous ideas into end-to-end web experiences, mentoring peers, and
      using technology to create inclusive learning opportunities.
    </p>
    <ul class="home-hero__highlights">
      <li>🔧 Full-stack projects with React, Node.js, and Python</li>
      <li>🧠 Strong interest in human-computer interaction and accessibility</li>
      <li>🌍 Community workshops championing digital literacy</li>
    </ul>
    <p class="home-hero__cta">
      <a href="{{ '/projects/' | relative_url }}" class="btn">View Projects</a>
      <a href="{{ site.resume_pdf | default: '/assets/pdf/resume.pdf' | relative_url }}" class="btn btn--ghost" target="_blank" rel="noopener noreferrer">Resume</a>
    </p>
  </div>
</section>

<section class="home-summary" data-reveal>
  <h2>What I’m focused on</h2>
  <div class="home-summary__grid">
    <article>
      <h3>Building purposeful products</h3>
      <p>
        From ideation to deployment, I lead lightweight product discovery,
        define user journeys, and implement clean, testable code that brings
        value to real people.
      </p>
    </article>
    <article>
      <h3>Teaching and mentoring</h3>
      <p>
        I facilitate Hour of Code sessions, help classmates debug gnarly
        problems, and document what I learn so others can move faster.
      </p>
    </article>
    <article>
      <h3>Continuous learning</h3>
      <p>
        Currently exploring data visualization and AI-assisted creativity to
        tell richer stories with data-driven interfaces.
      </p>
    </article>
  </div>
</section>

<section class="home-projects-teaser" data-reveal>
  <h2>Recent Highlights</h2>
  <ul>
    <li><strong>Project 1:</strong> Smart Planner dashboard turning course goals into actionable sprints.</li>
    <li><strong>Hour of Code:</strong> Workshop that guided 60+ students through first-time coding wins.</li>
    <li><strong>Design Systems Lab:</strong> Modular component library powering multiple club websites.</li>
  </ul>
  <p>
    Want more details? Head over to the <a href="/projects/">projects page</a>
    for write-ups, screenshots, and tech stacks.
  </p>
</section>
