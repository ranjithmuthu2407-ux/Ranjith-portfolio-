import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, ArrowUpRight, Menu, X, MapPin, Crosshair, FileSearch, Fingerprint, GraduationCap, BookOpen, ShieldCheck, Stamp, Newspaper } from 'lucide-react';
import { VscVscode } from 'react-icons/vsc';
import { FaGithub, FaLinkedinIn, FaInstagram, FaXTwitter, FaEnvelope } from 'react-icons/fa6';
import { SiPython, SiJavascript, SiPhp, SiHtml5, SiCss, SiReact, SiTailwindcss, SiVite, SiNodedotjs, SiFastapi, SiPostgresql, SiMysql, SiSupabase, SiGit, SiRender } from 'react-icons/si';
import { certifications, education, experience, profile, projects } from './data/portfolio';
import Letterpress from './components/Letterpress';

function SectionHead({ kicker, title, copy }: { kicker: string; title: ReactNode; copy?: string }) {
  return <div className="section-head reveal"><p className="eyebrow">{kicker}</p><h2>{title}</h2>{copy && <p className="section-copy">{copy}</p>}</div>;
}
const skillNodes = [
  { name: 'Python', Icon: SiPython, x: 9, y: 20, group: 'LANGUAGE' },
  { name: 'JavaScript', Icon: SiJavascript, x: 29, y: 13, group: 'LANGUAGE' },
  { name: 'PHP', Icon: SiPhp, x: 49, y: 20, group: 'LANGUAGE' },
  { name: 'HTML5', Icon: SiHtml5, x: 70, y: 13, group: 'WEB' },
  { name: 'CSS3', Icon: SiCss, x: 89, y: 22, group: 'WEB' },
  { name: 'React', Icon: SiReact, x: 19, y: 49, group: 'FRONTEND' },
  { name: 'Tailwind', Icon: SiTailwindcss, x: 40, y: 43, group: 'FRONTEND' },
  { name: 'Vite', Icon: SiVite, x: 60, y: 51, group: 'TOOLING' },
  { name: 'Node.js', Icon: SiNodedotjs, x: 81, y: 48, group: 'BACKEND' },
  { name: 'FastAPI', Icon: SiFastapi, x: 10, y: 79, group: 'BACKEND' },
  { name: 'PostgreSQL', Icon: SiPostgresql, x: 30, y: 84, group: 'DATA' },
  { name: 'MySQL', Icon: SiMysql, x: 49, y: 76, group: 'DATA' },
  { name: 'Supabase', Icon: SiSupabase, x: 68, y: 84, group: 'DATA' },
  { name: 'Git', Icon: SiGit, x: 89, y: 79, group: 'TOOLS' },
  { name: 'VS Code', Icon: VscVscode, x: 49, y: 98, group: 'TOOLS' },
  { name: 'Render', Icon: SiRender, x: 72, y: 98, group: 'DEPLOY' }
];
const projectEvidence = [
  ['Role-based access control', 'Encrypted session handling', 'Supabase PostgreSQL', 'Grade tracking & audit records'],
  ['Book issue / return workflow', 'Timestamped transactions', 'Fine calculation logic', 'Catalogue indexing & dashboards'],
  ['Tamil document preprocessing', 'Image binarisation utilities', 'OCR bounding-box workflows', 'Open-source collaboration']
];
const skillConnections = [[0,5],[0,9],[0,10],[0,11],[0,12],[1,2],[1,5],[1,6],[1,7],[1,8],[2,10],[3,4],[3,5],[3,6],[3,7],[4,5],[4,6],[5,6],[5,7],[6,7],[7,8],[8,11],[8,12],[9,10],[9,11],[10,11],[10,12],[11,12],[12,15],[13,14],[13,15],[1,13],[0,13]];
const mobileSkillPositions = [[18,9],[50,9],[82,9],[18,25],[50,25],[82,25],[18,41],[50,41],[82,41],[18,57],[50,57],[82,57],[18,73],[50,73],[82,73],[50,89]].map(([x,y]) => ({x,y}));
const desktopSkillPositions = skillNodes.map(({x,y}) => ({x,y}));
type SkillPosition = { x: number; y: number };
type SkillDragState = {
  index: number;
  pointerId: number;
  startX: number;
  startY: number;
  startPositions: SkillPosition[];
  neighbours: Record<number, SkillPosition>;
  pendingPointer: { x: number; y: number } | null;
  frameId: number | null;
};
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const getDefaultSkillPositions = (): SkillPosition[] => (typeof window !== 'undefined' && window.matchMedia('(max-width: 700px)').matches ? mobileSkillPositions : desktopSkillPositions).map(point => ({ ...point }));
const getSkillConnectionPath = (positions: SkillPosition[], a: number, b: number, index: number) => {
  const p = positions[a], q = positions[b];
  const dx = q.x - p.x, dy = q.y - p.y, len = Math.max(1, Math.hypot(dx, dy));
  const sway = ((index % 5) - 2) * 1.4;
  const cx = (p.x + q.x) / 2 - (dy / len) * sway;
  const cy = (p.y + q.y) / 2 + (dx / len) * sway + Math.min(5, len * .055);
  return `M ${p.x} ${p.y} Q ${cx} ${cy} ${q.x} ${q.y}`;
};
const getDraggedSkillPositions = (drag: SkillDragState, clientX: number, clientY: number, rect: DOMRect): SkillPosition[] => {
  const x = clamp((clientX - rect.left) / rect.width * 100, 4, 96);
  const y = clamp((clientY - rect.top) / rect.height * 100, 5, 95);
  const dx = (clientX - drag.startX) / rect.width * 100;
  const dy = (clientY - drag.startY) / rect.height * 100;
  const next = drag.startPositions.map(point => ({ ...point }));
  next[drag.index] = { x, y };
  Object.entries(drag.neighbours).forEach(([key, origin]) => {
    const neighbour = Number(key);
    next[neighbour] = { x: clamp(origin.x + dx * .13, 3, 97), y: clamp(origin.y + dy * .13, 4, 96) };
  });
  return next;
};
const syncSkillPositionsToDom = (canvas: HTMLDivElement, positions: SkillPosition[]) => {
  canvas.querySelectorAll<HTMLButtonElement>('.evidence-node').forEach((node, index) => {
    const point = positions[index];
    if (!point) return;
    node.style.left = point.x + '%';
    node.style.top = point.y + '%';
    node.style.setProperty('--node-x', point.x + '%');
    node.style.setProperty('--node-y', point.y + '%');
  });
  canvas.querySelectorAll<SVGGElement>('.network-lines g').forEach((group, index) => {
    const connection = skillConnections[index];
    if (!connection) return;
    const path = getSkillConnectionPath(positions, connection[0], connection[1], index);
    group.querySelectorAll<SVGPathElement>('path').forEach(element => element.setAttribute('d', path));
  });
  canvas.querySelectorAll<SVGCircleElement>('.thread-junction').forEach((circle, index) => {
    const point = positions[index];
    if (!point) return;
    circle.setAttribute('cx', String(point.x));
    circle.setAttribute('cy', String(point.y));
  });
};

function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const pointRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const updateCursor = (event: PointerEvent) => {
      pointRef.current = { x: event.clientX, y: event.clientY };
      if (frameRef.current !== null) return;
      frameRef.current = window.requestAnimationFrame(() => {
        const { x, y } = pointRef.current;
        cursorRef.current?.style.setProperty('--cursor-x', `${x}px`);
        cursorRef.current?.style.setProperty('--cursor-y', `${y}px`);
        ringRef.current?.style.setProperty('--cursor-x', `${x}px`);
        ringRef.current?.style.setProperty('--cursor-y', `${y}px`);
        frameRef.current = null;
      });
    };
    const updateHoverState = (event: PointerEvent) => {
      const target = event.target;
      const interactive = target instanceof Element && target.closest('a, button, input, textarea, select, [role="button"]');
      ringRef.current?.classList.toggle('is-hovering', Boolean(interactive));
    };
    const hideCursor = () => {
      cursorRef.current?.classList.add('is-hidden');
      ringRef.current?.classList.add('is-hidden');
    };
    const showCursor = () => {
      cursorRef.current?.classList.remove('is-hidden');
      ringRef.current?.classList.remove('is-hidden');
    };
    window.addEventListener('pointermove', updateCursor, { passive: true });
    document.addEventListener('pointerover', updateHoverState, { passive: true });
    document.addEventListener('pointerout', updateHoverState, { passive: true });
    document.addEventListener('pointerleave', hideCursor);
    document.addEventListener('pointerenter', showCursor);
    return () => {
      window.removeEventListener('pointermove', updateCursor);
      document.removeEventListener('pointerover', updateHoverState);
      document.removeEventListener('pointerout', updateHoverState);
      document.removeEventListener('pointerleave', hideCursor);
      document.removeEventListener('pointerenter', showCursor);
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return <><span ref={cursorRef} className="custom-cursor-dot" aria-hidden="true"/><span ref={ringRef} className="custom-cursor-ring" aria-hidden="true"/></>;
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeCert, setActiveCert] = useState<number | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<number | null>(null);
  const [skillPositions, setSkillPositions] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 700px)').matches ? mobileSkillPositions : desktopSkillPositions);
  const [draggingSkill, setDraggingSkill] = useState<number | null>(null);
  const networkRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<SkillDragState | null>(null);
  const snapbackTimerRef = useRef<number | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const nodes = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) { nodes.forEach(n => n.classList.add('visible')); return; }
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    }), { threshold: 0.12 });
    nodes.forEach(n => observer.observe(n));
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const updateLayout = () => {
      if (dragRef.current) return;
      setSkillPositions(window.matchMedia('(max-width: 700px)').matches ? mobileSkillPositions : desktopSkillPositions);
    };
    window.addEventListener('resize', updateLayout);
    return () => {
      window.removeEventListener('resize', updateLayout);
      if (snapbackTimerRef.current !== null) window.clearTimeout(snapbackTimerRef.current);
      if (dragRef.current && dragRef.current.frameId !== null) {
        window.cancelAnimationFrame(dragRef.current.frameId);
      }
    };
  }, []);
  const beginSkillDrag = (index:number, event:React.PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;
    if (snapbackTimerRef.current !== null) {
      window.clearTimeout(snapbackTimerRef.current);
      snapbackTimerRef.current = null;
    }
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const neighbours = Object.fromEntries(skillConnections.flatMap(([a,b]) => a === index ? [[b,{...skillPositions[b]}]] : b === index ? [[a,{...skillPositions[a]}]] : []));
    dragRef.current = {
      index,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startPositions: skillPositions.map(point => ({ ...point })),
      neighbours,
      pendingPointer: null,
      frameId: null
    };
    setDraggingSkill(index);
    setSelectedSkill(index);
  };
  const moveSkillDrag = (event:React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || event.pointerId !== drag.pointerId) return;
    drag.pendingPointer = { x: event.clientX, y: event.clientY };
    if (drag.frameId !== null) return;

    // Coalesce pointer events to one direct DOM update per animation frame.
    drag.frameId = window.requestAnimationFrame(() => {
      drag.frameId = null;
      const canvas = networkRef.current;
      const pointer = drag.pendingPointer;
      if (dragRef.current !== drag || !canvas || !pointer) return;
      drag.pendingPointer = null;
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const next = getDraggedSkillPositions(drag, pointer.x, pointer.y, rect);
      syncSkillPositionsToDom(canvas, next);
    });
  };
  const finishSkillDrag = (event:React.PointerEvent<HTMLElement>) => {
    const drag = dragRef.current;
    if (!drag || event.pointerId !== drag.pointerId) return;
    if (drag.frameId !== null) window.cancelAnimationFrame(drag.frameId);
    drag.frameId = null;
    const canvas = networkRef.current;
    const rect = canvas?.getBoundingClientRect();
    const finalPositions = canvas && rect && rect.width && rect.height
      ? getDraggedSkillPositions(drag, event.clientX, event.clientY, rect)
      : drag.startPositions;
    if (canvas) syncSkillPositionsToDom(canvas, finalPositions);
    dragRef.current = null;
    setDraggingSkill(null);
    setSkillPositions(finalPositions);

    // Restore every node and clear all trace styling after the three-second hold.
    if (snapbackTimerRef.current !== null) window.clearTimeout(snapbackTimerRef.current);
    snapbackTimerRef.current = window.setTimeout(() => {
      setSkillPositions(getDefaultSkillPositions());
      setSelectedSkill(null);
      snapbackTimerRef.current = null;
    }, 3000);
  };

  const cancelSkillDrag = (pointerId:number) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== pointerId) return;
    if (drag.frameId !== null) window.cancelAnimationFrame(drag.frameId);
    dragRef.current = null;
    setDraggingSkill(null);
    if (snapbackTimerRef.current !== null) {
      window.clearTimeout(snapbackTimerRef.current);
      snapbackTimerRef.current = null;
    }
    setSkillPositions(getDefaultSkillPositions());
    setSelectedSkill(null);
  };
  useEffect(() => {
    if (activeCert === null) return;
    const closeButton = modalRef.current?.querySelector<HTMLButtonElement>('.modal-close');
    closeButton?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setActiveCert(null); return; }
      if (event.key === 'Tab' && modalRef.current) {
        const focusable = Array.from(modalRef.current.querySelectorAll<HTMLElement>('button, a[href], [tabindex]:not([tabindex="-1"])')).filter(el => !el.hasAttribute('disabled'));
        if (!focusable.length) return;
        const first = focusable[0]; const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => { window.removeEventListener('keydown', onKeyDown); previousFocusRef.current?.focus(); };
  }, [activeCert]);
  const nav = [['About', '#about'], ['Skills', '#skills'], ['Experience', '#experience'], ['Projects', '#projects'], ['Archive', '#certifications'], ['Education', '#education']];
  return <div className="site-shell"><CustomCursor/>
    <div className="grain" aria-hidden="true" />
    <header className="topbar">
      <a className="brand" href="#home" aria-label="Ranjith M home"><span className="brand-mark">RM</span><span>RANJITH M<span className="brand-sub">DEVELOPER · PORTFOLIO</span></span></a>
      <nav className={menuOpen ? 'nav-links open' : 'nav-links'} aria-label="Main navigation">{nav.map(([label, href]) => <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label}</a>)}</nav>
      <a className="nav-contact group" href="#contact">Let's talk <ArrowUpRight className="icon-arrow-up-right" size={15}/></a>
      <button className="menu-toggle" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X/> : <Menu/>}</button>
    </header>

    <main>
      <section id="home" className="hero dark-section">
        <div className="hero-grid" />
        <div className="hero-content">
          <div className="newspaper-masthead"><span>THE DEVELOPER'S CHRONICLE</span><span>VILLUPURAM · TAMIL NADU</span><span>PORTFOLIO EDITION · 2026</span></div>
          <p className="eyebrow hero-kicker">COMPUTER SCIENCE · WEB DEVELOPMENT <span className="kicker-index">— VOL. 01</span></p>
          <p className="hero-overline">A PROFILE IN PROGRESS · HELLO, I'M</p>
          <h1><Letterpress text="Ranjith" /> <em><Letterpress text="M." delay={430} /></em></h1>
          <div className="hero-rule"><span/> <p>Building for the web. Learning by making.</p></div>
          <p className="hero-intro">Full-Stack Developer &amp; Open-Source Contributor specializing in Python, React, FastAPI, and Supabase. Proven experience engineering production-ready web architectures, optimizing image-preprocessing pipelines for Open TamilOCR, and integrating Generative AI workflows. Driven by writing clean, scalable code, engineering high-performance APIs, and building modern digital experiences.</p>
          <div className="hero-actions"><a className="button button-primary group" href="#projects">Explore my work <span className="icon-bubble"><ArrowDown className="icon-arrow-down" size={15}/></span></a><a className="button button-outline group" href="#contact">Get in touch <span className="icon-bubble"><ArrowUpRight className="icon-arrow-up-right" size={15}/></span></a><a className="resume-button border border-indigo-500/40 bg-indigo-500/10 hover:bg-indigo-500/20 text-white rounded-xl px-5 py-2.5 transition-all flex items-center gap-2 font-medium" href="/resume.pdf" target="_blank" rel="noopener noreferrer">View Resume ↗</a></div>
          <div className="hero-meta"><span><MapPin size={14}/> {profile.location}</span><span>PYTHON / REACT / WEB</span></div>
        </div>
        <div className="hero-aside"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="portrait-frame"><img src="/profile.png" alt="Portrait of Ranjith M" fetchPriority="high"/><span className="portrait-caption">FIG. 01 — THE DEVELOPER</span></div><span className="vertical-note">INDEPENDENTLY CURIOUS · CONSTANTLY BUILDING</span></div>
        <span className="hero-bottom-note">SCROLL TO EXPLORE <span><ArrowDown className="icon-arrow-down" size={13}/></span></span>
      </section>

      <section id="about" className="paper-section about-section"><div className="section-number">01 / ABOUT</div><div className="about-layout"><SectionHead kicker="A LITTLE CONTEXT" title={<>Driven by Logic. <span className="font-serif italic text-red-600">Fueled by Open Source.</span></>}/><div className="about-body reveal"><p className="lead">I am a Computer Science student specializing in full-stack web development using Python, React, FastAPI, and Supabase. From engineering image-preprocessing pipelines for VGLUG's Open TamilOCR to integrating Generative AI workflows, I focus on writing clean code, optimizing database performance, and delivering production-ready applications.</p><p>I enjoy understanding how products work beneath the interface — from thoughtful frontend experiences to backend logic and data. I’m especially interested in language technology and tools that make digital information more accessible.</p><div className="about-signature">Ranjith M <span>— Developer in progress</span></div></div></div></section>

      <section id="skills" className="skills-section evidence-section">
        <div className="section-number light">02 / INTELLIGENCE WALL · CASE FILE 026</div>
        <div className="case-masthead"><span>THE TECHNICAL DOSSIER</span><span>SUBJECT: RANJITH M.</span><span>CLASSIFIED / OPEN SOURCE</span></div>
        <SectionHead kicker="CONNECTIONS, NOT JUST CHECKLISTS" title={<>Follow the <span className="font-serif italic text-red-600">connections.</span></>} copy="A visual investigation board mapping the tools and technologies used across the work. Follow the red thread between languages, interfaces, services and data stores."/>
        <div className="evidence-board reveal">
          <div className="board-topline"><span><Crosshair size={13}/> EVIDENCE MAP / 01</span><span>16 NODES · 33 CONNECTIONS</span><span>FIELD NOTES — 2026</span></div>
          <div className={draggingSkill === null ? "network-canvas" : "network-canvas is-dragging"} ref={networkRef} onPointerMove={moveSkillDrag} onPointerUp={finishSkillDrag} onPointerCancel={(event)=>cancelSkillDrag(event.pointerId)} aria-label="Interactive technology relationship board">
            <svg className="network-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              {skillConnections.map(([a,b],i)=>{const p=skillPositions[a],q=skillPositions[b];const active=selectedSkill===null||a===selectedSkill||b===selectedSkill;const dx=q.x-p.x,dy=q.y-p.y,len=Math.max(1,Math.hypot(dx,dy));const sway=((i%5)-2)*1.4;const cx=(p.x+q.x)/2-(dy/len)*sway;const cy=(p.y+q.y)/2+(dx/len)*sway+Math.min(5,len*.055);const d=`M ${p.x} ${p.y} Q ${cx} ${cy} ${q.x} ${q.y}`;return <g key={i} className={active?'is-active':'is-muted'}><path d={d} className="thread-shadow"/><path d={d} className={'thread-line'+(active?' is-active':' is-muted')}/></g>})}
              {skillPositions.map((point,i)=><circle key={i} cx={point.x} cy={point.y} r=".35" className="thread-junction"/>)}
            </svg>
            {skillNodes.map(({name,Icon,group},i)=>{const connected=selectedSkill!==null&&skillConnections.some(([a,b])=>(a===i&&b===selectedSkill)||(b===i&&a===selectedSkill));const selected=selectedSkill===i;const dimmed=selectedSkill!==null&&!selected&&!connected;return <button type="button" key={name} data-skill={i} className={'evidence-node node-'+i+(selected?' is-selected':'')+(connected?' is-connected':'')+(dimmed?' is-dimmed':'')+(draggingSkill===i?' is-dragging':'')} style={{left:skillPositions[i].x+'%',top:skillPositions[i].y+'%','--node-x':skillPositions[i].x+'%','--node-y':skillPositions[i].y+'%'} as React.CSSProperties} aria-pressed={selected} aria-label={'Drag '+name+' to rearrange the board, or select to trace its connections'} onPointerDown={event=>beginSkillDrag(i,event)} onPointerUp={finishSkillDrag} onLostPointerCapture={event=>{if(dragRef.current?.pointerId===event.pointerId)finishSkillDrag(event)}} onClick={event=>{if(event.detail===0)setSelectedSkill(selected?null:i)}}>
              <span className="node-pin"/><span className="node-logo"><Icon/></span><span className="node-label">{name}</span><span className="node-class">{group}</span>
            </button>})}
            <div className="board-note note-one"><span>01 / INPUT</span> Languages & markup</div>
            <div className="board-note note-two"><span>02 / BUILD</span> UI & runtime</div>
            <div className="board-note note-three"><span>03 / STORE</span> Data & delivery</div>
          </div>
          <div className="board-legend"><span><i className="legend-dot red"/> Core relationship</span><span><i className="legend-dot cream"/> Tool / platform</span><span><i className="legend-dot gold"/> Data connection</span><span className="legend-stamp">EVIDENCE INDEXED</span></div>
        </div>
        <div className="skills-caption"><span>{selectedSkill===null?'FIELD NOTE 02-A':'TRACE ACTIVE'}</span><p aria-live="polite">{selectedSkill===null?'Drag a skill to rearrange the board. The skill and its connected nodes return to their original positions after 3 seconds. Tap or focus a skill to trace its relationships; connections show workflow relationships, not proficiency rankings.':`Tracing ${skillNodes[selectedSkill].name}: connected technologies are highlighted. Drag to reposition; select another skill to change the trace.`}</p></div>
      </section>

      <section id="experience" className="paper-section experience-section"><div className="section-number">03 / EXPERIENCE</div><SectionHead kicker="THE JOURNEY SO FAR" title={<>Learning through <span>experience.</span></>} copy="A timeline of internships and community contributions. Dates and statuses reflect the information currently confirmed."/><div className="timeline">{experience.map((item) => <article className="timeline-item reveal" key={item.org}><div className="timeline-marker"><span/></div><div className="timeline-date">{item.date}</div><div className="timeline-content"><div className="timeline-title"><div><h3>{item.role}</h3><p>{item.org}</p></div><span className={'status status-' + item.status.toLowerCase()}>{item.status}</span></div><p className="timeline-detail">{item.detail}</p></div></article>)}</div></section>

      <section id="projects" className="projects-section paper-evidence-section">
        <div className="section-number">04 / THE INVESTIGATION FILES</div>
        <div className="project-paper-head"><div><div className="clipping-kicker">SPECIAL REPORT · SELECTED WORK</div><h2>Work under<br/><span>investigation.</span></h2><p className="project-intro">Three case files. Each one records a problem space, the tools involved and the work that can be examined.</p></div><div className="edition-box"><Newspaper size={34}/><span>THE PROJECT<br/>GAZETTE</span><small>VOL. 04 · 2026</small></div></div>
        <div className="project-clippings">{projects.map((project,i)=><article className={'project-clipping clipping-'+i+' reveal'} key={project.name}>
          <div className="clipping-head"><span>CASE FILE NO. 0{i+1}</span><span>{project.type.toUpperCase()}</span></div>
          <div className="clipping-body"><div className="clipping-symbol">{i===0?<Fingerprint/>:i===1?<BookOpen/>:<FileSearch/>}</div><div className="clipping-copy"><h3><Letterpress text={project.name} delay={i * 90} /></h3><p className="clipping-deck">{i===0?'A record-keeping system for structured student information.':i===1?'A digital catalogue and circulation workflow for library operations.':'Tamil-language document recognition and image-preprocessing contribution.'}</p><p className="clipping-description">{project.description}</p><ul className="evidence-findings">{projectEvidence[i].map((fact,j)=><li key={j}><span>{String(j+1).padStart(2,'0')}</span>{fact}</li>)}</ul><div className="project-tags">{project.stack.map(tag=><span key={tag}>{tag}</span>)}</div></div></div>
          <div className="clipping-footer"><span><Stamp size={14}/> EVIDENCE / {i===2?'COMMUNITY CONTRIBUTION':'PROJECT RECORD'}</span>{project.repo?<a className={i===0?'inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white bg-gradient-to-r from-pink-500 via-rose-500 to-red-600 hover:from-pink-600 hover:to-red-700 rounded-md shadow-sm shadow-pink-500/20 transition-all cursor-pointer':'group'} href={i===0?'https://srms-student-record-maintenence-system.onrender.com/auth/login.php':project.repo} target="_blank" rel={i===0?'noopener noreferrer':'noreferrer'}>{i===0?'LIVE DEMO ↗':'EXAMINE SOURCE'} <ArrowUpRight className="icon-arrow-up-right" size={14}/></a>:<span className="source-pending">SOURCE URL NOT PROVIDED</span>}</div>
          {i===0&&<span className="ink-redaction-stamp" aria-hidden="true">FILED · REVIEWED</span>}
          {i===1&&<div className="clipping-tape" aria-hidden="true">LIBRARY FILE COPY</div>}
          {i===2&&<div className="contribution-seal">OPEN<br/>SOURCE</div>}
        </article>)}</div>
      </section>

      <section id="certifications" className="archive-section"><div className="section-number">05 / THE ARCHIVE</div><div className="archive-heading"><SectionHead kicker="DOCUMENTS OF THE JOURNEY" title={<>A wall of <span>milestones.</span></>} copy="An archival board of certificates and achievements. Select a document to inspect it."/></div><div className="archive-board"><div className="archive-stamp">PERSONAL<br/>ARCHIVE <span>EST. 2026</span></div><div className="pinboard">{certifications.map((cert, i) => <button className={'certificate-card cert-' + (i%4) + ' reveal'} key={cert.title} onClick={(event) => { previousFocusRef.current = event.currentTarget; setActiveCert(i); }} aria-label={'View certificate: ' + cert.title}><span className="pin"/><span className="cert-image"><img src={cert.image} alt={cert.title} loading="lazy"/></span><span className="cert-number">DOCUMENT NO. {String(i+1).padStart(2,'0')}</span><span className="cert-title"><Letterpress text={cert.title} delay={i * 55} /></span><span className="cert-issuer">{cert.issuer}</span>{cert.note && <span className="cert-note">{cert.note}</span>}</button>)}</div><p className="archive-foot">11 DOCUMENTS · ORIGINAL CREDENTIAL IMAGES · NO THIRD-PARTY VERIFICATION CLAIMS</p></div></section>

      <section id="education" className="education-section academic-dossier">
        <div className="section-number">06 / ACADEMIC RECORDS</div>
        <div className="education-masthead"><span>THE EDUCATION REGISTER</span><span>PERSONAL FILE · RM / 026</span></div>
        <SectionHead kicker="THE FORMATIVE YEARS" title={<>The record behind<br/><span>the byline.</span></>} copy="An academic record presented as a set of archived school and college documents. The details below preserve the qualifications and results supplied for this profile."/>
        <div className="education-dossier-grid">
          {education.map((item,i)=><article className={'education-document edu-'+i+' reveal'} key={item.degree}>
            <div className="document-corner">ARCHIVE COPY · 0{i+1}</div><div className="edu-seal">{i===0?<GraduationCap/>:<BookOpen/>}</div><p className="edu-document-kicker">{i===0?'COLLEGE RECORD':i===1?'HIGHER SECONDARY RECORD':'SECONDARY SCHOOL RECORD'}</p><h3><Letterpress text={item.degree} delay={i * 85} /></h3><div className="edu-rule"/><p className="edu-school">{item.school}</p><p className="edu-place">{item.place}</p>
            {item.result?<div className="result-slip"><span>RECORDED RESULT</span><strong>{item.result}</strong><small>AS SHOWN IN THE SUPPLIED PROFILE RECORD</small></div>:<div className="result-slip result-pending"><span>QUALIFICATION</span><strong>IN PROGRESS</strong><small>UNDERGRADUATE PROGRAMME</small></div>}
            <div className="edu-document-footer"><span>RANJITH M.</span><span>{i===0?'UNDERGRADUATE':'SCHOOLING'}</span></div>
          </article>)}
        </div>
        <div className="education-ledger"><div><span>01 / FOUNDATION</span><p>Secondary schooling at Government High School, Siruvalai.</p></div><div><span>02 / HIGHER SECONDARY</span><p>Higher Secondary education at Government Higher Secondary School, Panamalaippettai.</p></div><div><span>03 / UNDERGRADUATE</span><p>B.Sc. Computer Science at Arignar Anna Government Arts College, Villupuram.</p></div></div><div className="education-note"><ShieldCheck size={17}/><p>Academic details are displayed as supplied. No graduation year, institution dates or unprovided marks have been added.</p></div>
      </section>
    </main>

    <footer id="contact" className="footer dark-section"><div className="section-number light">07 / CONTACT</div><div className="footer-main"><div><p className="eyebrow">HAVE A PROJECT OR AN IDEA?</p><h2>Let's make<br/><span>something matter.</span></h2></div><a className="footer-email group" href={'mailto:' + profile.email}>{profile.email}<ArrowUpRight className="icon-arrow-up-right"/></a></div><p className="footer-thank-you text-2xl md:text-3xl font-medium tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-500 text-center my-4">Thank you!</p><div className="footer-bottom"><span>© {new Date().getFullYear()} Ranjith M · Built with curiosity.</span><div className="social-links"><a className="social-card" href={profile.github} target="_blank" rel="noopener noreferrer"><FaGithub aria-hidden="true"/><span>GitHub</span></a><a className="social-card" href={profile.linkedin} target="_blank" rel="noopener noreferrer"><FaLinkedinIn aria-hidden="true"/><span>LinkedIn</span></a><a className="social-card" href={profile.instagram} target="_blank" rel="noopener noreferrer" aria-label="Visit Ranjith on Instagram"><FaInstagram aria-hidden="true"/><span>Instagram</span></a><a className="social-card" href={profile.x} target="_blank" rel="noopener noreferrer"><FaXTwitter aria-hidden="true"/><span>X / Twitter</span></a><a className="social-card" href={'mailto:' + profile.email} target="_blank" rel="noopener noreferrer"><FaEnvelope aria-hidden="true"/><span>Email</span></a></div><a href="#home" className="back-top">BACK TO TOP <ArrowUp className="icon-arrow-up" size={12}/></a></div></footer>

    {activeCert !== null && <div className="modal-backdrop" role="presentation" onClick={() => setActiveCert(null)}><div className="cert-modal" ref={modalRef} role="dialog" aria-modal="true" aria-label={certifications[activeCert].title} onClick={e => e.stopPropagation()}><button className="modal-close" onClick={() => setActiveCert(null)} aria-label="Close certificate"><X/></button><img src={certifications[activeCert].image} alt={certifications[activeCert].title}/><div><p className="eyebrow">{certifications[activeCert].issuer}</p><h3>{certifications[activeCert].title}</h3>{certifications[activeCert].note && <p>{certifications[activeCert].note}</p>}</div></div></div>}
  </div>;
}
export default App;
