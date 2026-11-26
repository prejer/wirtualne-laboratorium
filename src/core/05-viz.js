// ---------- tryb Nauki: pomocnicze rysowanie (wektory, kąty, wymiary) + panel liczb w HTML ----------
let learnRows=null;
const viz={
 arrow(c,D,p,vec,col,label,o){o=o||{};const A=D.P2(p),B=D.P2(add(p,vec));if(!A||!B)return;const dx=B.x-A.x,dy=B.y-A.y,L=Math.hypot(dx,dy);if(L<2)return;const ux=dx/L,uy=dy/L,h=Math.min(11,L*0.45);
  c.save();c.strokeStyle=col;c.fillStyle=col;c.lineWidth=o.w||2.6;c.lineCap="round";if(o.dash)c.setLineDash([5,4]);c.beginPath();c.moveTo(A.x,A.y);c.lineTo(B.x-ux*h*0.6,B.y-uy*h*0.6);c.stroke();c.setLineDash([]);
  c.beginPath();c.moveTo(B.x,B.y);c.lineTo(B.x-ux*h-uy*h*0.45,B.y-uy*h+ux*h*0.45);c.lineTo(B.x-ux*h+uy*h*0.45,B.y-uy*h-ux*h*0.45);c.closePath();c.fill();
  if(label)viz.tag(c,B.x+ux*10,B.y+uy*10,label,col);c.restore()},
 tag(c,x,y,t,col){c.save();c.font="600 13px system-ui";c.textAlign="center";c.textBaseline="middle";const w=c.measureText(t).width+10;c.fillStyle="rgba(255,255,255,.88)";c.beginPath();c.roundRect(x-w/2,y-10,w,20,6);c.fill();c.fillStyle=col||"#111";c.fillText(t,x,y);c.restore()},
 dim(c,D,a,b,label,col){const A=D.P2(a),B=D.P2(b);if(!A||!B)return;c.save();c.strokeStyle=col||"#333";c.lineWidth=1.3;c.setLineDash([4,3]);c.beginPath();c.moveTo(A.x,A.y);c.lineTo(B.x,B.y);c.stroke();c.setLineDash([]);
  for(const[P,Q]of[[A,B],[B,A]]){const dx=Q.x-P.x,dy=Q.y-P.y,L=Math.hypot(dx,dy)||1;c.beginPath();c.moveTo(P.x-dy/L*5,P.y+dx/L*5);c.lineTo(P.x+dy/L*5,P.y-dx/L*5);c.stroke()}
  if(label)viz.tag(c,(A.x+B.x)/2,(A.y+B.y)/2,label,col);c.restore()},
 arc(c,D,O,e1,e2,ang,r,label,col){const pts=[];for(let k=0;k<=20;k++){const t=ang*k/20;pts.push(D.P2(add(O,add(mul(e1,r*Math.cos(t)),mul(e2,r*Math.sin(t))))))}if(pts.some(q=>!q))return;
  c.save();c.strokeStyle=col||"#333";c.lineWidth=1.8;c.beginPath();pts.forEach((q,i)=>i?c.lineTo(q.x,q.y):c.moveTo(q.x,q.y));c.stroke();if(label){const m=D.P2(add(O,add(mul(e1,r*1.6*Math.cos(ang/2)),mul(e2,r*1.6*Math.sin(ang/2)))));if(m)viz.tag(c,m.x,m.y,label,col)}c.restore()},
 line(c,D,a,b,col,dash){const A=D.P2(a),B=D.P2(b);if(!A||!B)return;c.save();c.strokeStyle=col;c.lineWidth=1.3;if(dash)c.setLineDash([4,4]);c.beginPath();c.moveTo(A.x,A.y);c.lineTo(B.x,B.y);c.stroke();c.restore()},
 panel(c,rows){learnRows=rows}};

