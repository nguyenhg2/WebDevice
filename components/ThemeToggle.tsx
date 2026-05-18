"use client";
import { useEffect, useState } from "react";
export default function ThemeToggle(){ const [dark,setDark]=useState(false); useEffect(()=>{ const v=localStorage.getItem("theme")==="dark"; setDark(v); document.documentElement.classList.toggle("dark",v);},[]); return <button className="btn bg-slate-700" aria-label="Đổi giao diện sáng tối" onClick={()=>{const n=!dark; setDark(n); localStorage.setItem("theme",n?"dark":"light"); document.documentElement.classList.toggle("dark",n);}}>{dark?"Sáng":"Tối"}</button> }
