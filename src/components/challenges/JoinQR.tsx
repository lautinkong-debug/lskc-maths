"use client";
import Image from "next/image";
import { useEffect,useState } from "react";
import QRCode from "qrcode";
import { copy } from "@/lib/copy";

export function JoinQR({url}:{url:string}){
  const [image,setImage]=useState("");
  useEffect(()=>{let active=true;QRCode.toDataURL(url,{width:240,margin:2,errorCorrectionLevel:"M"}).then((result)=>{if(active)setImage(result);}).catch(()=>setImage(""));return()=>{active=false;};},[url]);
  return image?<Image src={image} alt={copy.challenges.qrAlt} width={240} height={240} unoptimized className="border-grid bg-paper rounded border p-2"/>:<p className="border-grid flex size-60 items-center justify-center rounded border">{copy.challenges.joinUrl}</p>;
}
