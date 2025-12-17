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
      A Computer Science bachelor student and aspiring penetration tester (ethical hacker) focused on finding bugs even in robust, scalable code. Passionate about cybersecurity, network defense, and vulnerability assessment, with hands-on experience in security labs and real-world attack simulations. Continuously improving skills through practical challenges and industry-recognized learning resources.
    </p>
    <ul class="home-hero__highlights">
      <li>🔧 Packet Tracer labs and CCNA projects</li>
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
      <h3>Discovering and learning esssentials of several IT fields</h3>
      <p>
        Discovering and learning the essentials of several IT fields through coursework, labs, and independent projects. Developing a versatile technical foundation while deepening expertise in chosen areas. Committed to continuous growth in a rapidly evolving tech landscape.
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
        Currently exploring basics of being professional ethic hacker.
      </p>
    </article>
  </div>
</section>

<section class="home-projects-teaser" data-reveal>
  <h2>Recent Highlights</h2>
  <ul>
    <li><strong>Project 1: How does hardware work?</strong> Building logical gates (AND,OR,NAND,XOR) using hardware components such as transistors, resistors, jumper wires etc.</li>
    <li><strong>Hour of AI:</strong> Workshop that guided 17 students through first-time coding wins.</li>
    <li><strong>Troubleshooting in Packet Tracer</strong> Finding network issues causing non-connectiveness.</li>
  </ul>
  <p>
    Want more details? Head over to the <a href="{{ '/projects/' | relative_url }}">projects page</a>
    for write-ups, screenshots, and tech stacks.
  </p>
</section>
