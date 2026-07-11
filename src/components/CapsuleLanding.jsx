'use client';
// Experience 1 — cinematic capsule hero (Site 1 aesthetic, Site 2 palette).
// Capsule drifts in → opens → two-tone pills float out and bob.
// CLICK ANY PILL → the camera dives through THAT pill into /shop.
// The Enter button (or empty space) picks a random pill — different journey every time.
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as THREE from 'three';
import gsap from 'gsap';

// Site 1 "pill" duos on Site 2's violet/indigo world
const PILL_DUOS = [
  ['#6B54FD', '#F4F2FF'], ['#4D7CFE', '#FFC943'], ['#FF6B6B', '#FFF1F1'],
  ['#FFC943', '#1C0D71'], ['#A78BFA', '#FFFFFF'], ['#FF8A5C', '#F4F2FF'],
  ['#38BDF8', '#FFFFFF'], ['#F472B6', '#FFF7FB'],
];
const TABLET_SOLIDS = ['#FFC943', '#FF6B6B', '#F4F2FF', '#7DE3D8'];

export default function CapsuleLanding() {
  const mountRef = useRef(null);
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const introDoneRef = useRef(false); // event handlers must read a ref, not stale state
  const [leaving, setLeaving] = useState(false);
  const [hoverPill, setHoverPill] = useState(false);
  const enterRef = useRef(() => {});

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(0, 0.2, 9);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    // Lighting tuned for glossy plastic look (Site 1 render feel)
    scene.add(new THREE.AmbientLight(0xffffff, 0.75));
    const key = new THREE.DirectionalLight(0xffffff, 2.6); key.position.set(5, 7, 6); scene.add(key);
    const fill = new THREE.DirectionalLight(0xa78bfa, 0.9); fill.position.set(-6, -1, 4); scene.add(fill);
    const rim = new THREE.DirectionalLight(0x4d7cfe, 1.3); rim.position.set(0, -4, -6); scene.add(rim);

    const gloss = (color) => new THREE.MeshPhysicalMaterial({
      color, roughness: 0.18, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.08,
      sheen: 0.4, sheenColor: new THREE.Color('#ffffff'),
    });

    // --- Hero capsule halves ---
    const R = 1.05, L = 3.4;
    const makeHalf = (mat, dir, innerColor) => {
      const g = new THREE.Group();
      const cyl = new THREE.Mesh(new THREE.CylinderGeometry(R, R, L / 2, 64, 1, true), mat);
      cyl.position.y = dir * L / 4;
      const cap = new THREE.Mesh(new THREE.SphereGeometry(R, 64, 32, 0, Math.PI * 2, dir > 0 ? 0 : Math.PI / 2, Math.PI / 2), mat);
      cap.position.y = dir * L / 2;
      const inner = new THREE.Mesh(new THREE.CircleGeometry(R * 0.98, 48),
        new THREE.MeshStandardMaterial({ color: innerColor, side: THREE.DoubleSide, roughness: 0.5 }));
      inner.rotation.x = Math.PI / 2;
      g.add(cyl, cap, inner);
      return g;
    };
    const capsule = new THREE.Group();
    const topHalf = makeHalf(gloss('#6B54FD'), 1, '#4b39c9');
    const botHalf = makeHalf(gloss('#F4F2FF'), -1, '#d9d3f7');
    capsule.add(topHalf, botHalf);
    capsule.rotation.z = Math.PI / 2.15;
    capsule.scale.setScalar(0.55);
    scene.add(capsule);

    // --- Floating pills (two-tone minis + solid tablets), all clickable ---
    const pills = [];
    const hitMeshes = [];
    const makeMiniPill = ([cA, cB]) => {
      const g = new THREE.Group();
      const r = 0.16, l = 0.46;
      const half = (mat, dir) => {
        const grp = new THREE.Group();
        const cyl = new THREE.Mesh(new THREE.CylinderGeometry(r, r, l / 2, 32, 1, true), mat);
        cyl.position.y = dir * l / 4;
        const cap = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 16, 0, Math.PI * 2, dir > 0 ? 0 : Math.PI / 2, Math.PI / 2), mat);
        cap.position.y = dir * l / 2;
        grp.add(cyl, cap);
        return grp;
      };
      g.add(half(gloss(cA), 1), half(gloss(cB), -1));
      return g;
    };
    for (let i = 0; i < 14; i++) {
      const twoTone = i % 7 < 5;
      const obj = twoTone
        ? makeMiniPill(PILL_DUOS[i % PILL_DUOS.length])
        : new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.1, 40), gloss(TABLET_SOLIDS[i % TABLET_SOLIDS.length]));
      obj.visible = false;
      const a = (i / 14) * Math.PI * 2 + 0.35;
      obj.userData.home = new THREE.Vector3(
        Math.cos(a) * (2.5 + (i % 3) * 0.7),
        Math.sin(a) * (1.55 + (i % 4) * 0.42),
        -0.7 + (i % 5) * 0.42
      );
      obj.userData.spin = 0.25 + Math.random() * 0.55;
      obj.userData.phase = Math.random() * Math.PI * 2;
      obj.userData.baseRot = new THREE.Euler(Math.random(), Math.random() * 2, Math.random());
      obj.rotation.copy(obj.userData.baseRot);
      scene.add(obj);
      pills.push(obj);
      obj.traverse((m) => { if (m.isMesh) { m.userData.pill = obj; hitMeshes.push(m); } });
      if (obj.isMesh) { obj.userData.pill = obj; hitMeshes.push(obj); }
    }

    // --- Intro timeline ---
    const vec = (v) => ({ x: v.x, y: v.y, z: v.z });
    const tl = gsap.timeline({ defaults: { ease: 'power3.inOut' } });
    if (reduced) {
      capsule.scale.setScalar(1); topHalf.position.y = 1.6; botHalf.position.y = -1.6;
      pills.forEach((p) => { p.visible = true; p.position.copy(p.userData.home); });
      introDoneRef.current = true;
      setReady(true);
    } else {
      tl.to(capsule.scale, { x: 1, y: 1, z: 1, duration: 1.35, ease: 'power2.out' })
        .to(capsule.rotation, { z: Math.PI / 2, y: 0.3, duration: 1.35 }, 0)
        .to(capsule.position, { y: 0.05, duration: 1.35 }, 0)
        .to({}, { duration: 0.55 })
        .to(topHalf.position, { y: 1.7, duration: 1.15, ease: 'power4.inOut' })
        .to(botHalf.position, { y: -1.7, duration: 1.15, ease: 'power4.inOut' }, '<')
        .to(capsule.rotation, { x: 0.12, duration: 1.15 }, '<')
        .add(() => pills.forEach((p) => {
          p.visible = true; p.scale.setScalar(0.01);
          gsap.to(p.scale, { x: 1, y: 1, z: 1, duration: 0.75, ease: 'back.out(1.7)', delay: Math.random() * 0.2 });
          gsap.to(p.position, { ...vec(p.userData.home), duration: 1.3, ease: 'power3.out', delay: Math.random() * 0.28 });
        }), '-=0.6')
        .add(() => { introDoneRef.current = true; setReady(true); }, '-=0.25');
    }

    // --- Exit: dive INTO a pill (specific if clicked, random otherwise) ---
    let exiting = false;
    const dive = (pill) => {
      if (exiting || !pill || !pill.visible) return; exiting = true;
      setLeaving(true);
      const target = pill.position.clone();
      const go = () => router.push('/shop');
      if (reduced) return void setTimeout(go, 320);
      gsap.timeline({ onComplete: go })
        .to(pills.filter((p) => p !== pill).map((p) => p.scale), { x: 0.6, y: 0.6, z: 0.6, duration: 0.5, ease: 'power2.in' }, 0)
        .to(camera.position, { x: target.x, y: target.y, z: target.z + 0.5, duration: 1.15, ease: 'power3.in' }, 0)
        .to(pill.scale, { x: 16, y: 16, z: 16, duration: 0.95, ease: 'power3.in' }, 0.35)
        .to(pill.rotation, { x: pill.rotation.x + 1.1, z: pill.rotation.z + 0.7, duration: 0.95 }, 0.35);
    };
    enterRef.current = () => dive(pills[Math.floor(Math.random() * pills.length)]);

    // --- Raycasting: hover glow + click a pill to travel through it ---
    const ray = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hovered = null;
    const setMouse = (e) => {
      const r = mount.getBoundingClientRect();
      mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      mouse.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    };
    const pillAt = (e) => {
      setMouse(e);
      ray.setFromCamera(mouse, camera);
      const hit = ray.intersectObjects(hitMeshes, false)[0];
      return hit?.object?.userData?.pill || null;
    };
    const onClick = (e) => {
      if (!introDoneRef.current) return;
      const p = pillAt(e);
      p ? dive(p) : enterRef.current();
    };
    const onHover = (e) => {
      if (exiting) return;
      const p = pillAt(e);
      if (p !== hovered) {
        if (hovered) gsap.to(hovered.scale, { x: 1, y: 1, z: 1, duration: 0.3 });
        hovered = p;
        if (p) gsap.to(p.scale, { x: 1.35, y: 1.35, z: 1.35, duration: 0.3, ease: 'back.out(2)' });
        setHoverPill(!!p);
      }
    };
    mount.addEventListener('click', onClick);
    mount.addEventListener('pointermove', onHover);

    // --- Loop ---
    const clock = new THREE.Clock();
    let raf;
    const pointer = { x: 0, y: 0 };
    const onMove = (e) => { pointer.x = (e.clientX / window.innerWidth - 0.5) * 2; pointer.y = (e.clientY / window.innerHeight - 0.5) * 2; };
    window.addEventListener('pointermove', onMove);
    const loop = () => {
      const t = clock.getElapsedTime();
      capsule.rotation.y += 0.0016;
      capsule.position.y = 0.05 + Math.sin(t * 0.7) * 0.06;
      pills.forEach((p) => {
        if (!p.visible || exiting) return;
        p.position.y = p.userData.home.y + Math.sin(t * 0.9 + p.userData.phase) * 0.15;
        p.rotation.x += 0.004 * p.userData.spin;
        p.rotation.z += 0.006 * p.userData.spin;
      });
      if (!exiting) {
        camera.position.x += (pointer.x * 0.45 - camera.position.x) * 0.03;
        camera.position.y += (0.2 - pointer.y * 0.32 - camera.position.y) * 0.03;
        camera.lookAt(0, 0, 0);
      }
      renderer.render(scene, camera);
      raf = requestAnimationFrame(loop);
    };
    loop();

    const onResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(raf); tl.kill(); gsap.globalTimeline.clear();
      window.removeEventListener('resize', onResize); window.removeEventListener('pointermove', onMove);
      mount.removeEventListener('click', onClick); mount.removeEventListener('pointermove', onHover);
      renderer.dispose(); mount.contains(renderer.domElement) && mount.removeChild(renderer.domElement);
      scene.traverse((o) => { o.geometry?.dispose?.(); o.material?.dispose?.(); });
    };
  }, [router]);

  return (
    <section className="relative h-[92vh] min-h-[560px] overflow-hidden bg-[#0D0056]">
      {/* Site 2 hero glows */}
      <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-[#6B54FD]/40 blur-[110px]" />
      <div className="pointer-events-none absolute -right-16 bottom-8 h-96 w-96 rounded-full bg-[#4D7CFE]/30 blur-[120px]" />
      <div className="pointer-events-none absolute right-1/4 top-0 h-56 w-56 rounded-full bg-[#FFC943]/20 blur-[100px]" />
      <div ref={mountRef} className={`absolute inset-0 ${hoverPill ? 'cursor-pointer' : 'cursor-default'}`} aria-hidden />
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between px-6 py-5 text-mint-soft">
        <span className="font-display text-xl font-bold">Aarogya <span className="opacity-70">Pharmacy</span></span>
        <span className="hidden text-xs font-bold uppercase tracking-[.25em] opacity-70 sm:block">Telangana · Est. on trust</span>
      </div>
      <div className={`pointer-events-none absolute inset-x-0 bottom-12 text-center transition-all duration-700 ${ready ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <h1 className="mx-auto max-w-3xl px-6 font-display text-4xl font-bold leading-tight text-white md:text-6xl">
          Ultimate healthcare,<br className="hidden md:block" /> today and tomorrow.
        </h1>
        <p className="mx-auto mt-3 max-w-xl px-6 text-[#C9C2F5]">Authentic medicines, AI-verified prescriptions, doorstep delivery across Telangana.</p>
        <button onClick={() => enterRef.current()} className="pointer-events-auto mt-6 rounded-full bg-[#6B54FD] px-9 py-3.5 font-semibold text-white shadow-lift transition hover:bg-[#5A43E8] hover:scale-[1.03] active:scale-[.98]">
          Enter the pharmacy →
        </button>
        <p className="mt-3 text-[12px] text-[#C9C2F5]/80">✨ or click any floating pill to travel through it</p>
      </div>
      <div className={`pointer-events-none absolute inset-0 bg-[#F9F8FF] transition-opacity duration-500 ${leaving ? 'opacity-100' : 'opacity-0'}`} />
    </section>
  );
}
