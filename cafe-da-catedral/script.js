const header=document.querySelector('header'),nav=document.querySelector('nav');
const onScroll=()=>header.classList.toggle('scrolled',scrollY>40);
onScroll();addEventListener('scroll',onScroll,{passive:true});
document.querySelector('.menu-btn').addEventListener('click',()=>nav.classList.toggle('open'));
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
