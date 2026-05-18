"use client";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
export default function SearchBar({compact=false}:{compact?:boolean}){ const [q,setQ]=useState(""); const router=useRouter(); function submit(e:FormEvent){e.preventDefault(); if(q.trim()) router.push("/api/search?q="+encodeURIComponent(q.trim()));} return <form onSubmit={submit} className={compact?"hidden md:block":"w-full"}><input className="input" aria-label="Tìm kiếm game, GPU, CPU, laptop" placeholder="Tìm game, GPU, CPU..." value={q} onChange={(e)=>setQ(e.target.value)} /></form> }
