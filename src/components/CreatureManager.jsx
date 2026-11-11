import React from 'react'
import * as THREE from 'three'
import {Camel} from './creatures/Camel'
import {Fox} from './creatures/Fox'
import {Lizard} from './creatures/Lizard'
import {Scorpion} from './creatures/Scorpion'
import {useStore} from '../store'
import {deserts} from '../data/deserts'
import {getTerrainHeight} from '../utils/terrainUtils'
const map={Camel,Fox,Lizard,Scorpion}
// Soft radial blob used to ground each creature (contact shadow).
const blobTexture=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d');const g=ctx.createRadialGradient(64,64,6,64,64,62);g.addColorStop(0,'rgba(30,22,14,0.4)');g.addColorStop(0.65,'rgba(30,22,14,0.18)');g.addColorStop(1,'rgba(30,22,14,0)');ctx.fillStyle=g;ctx.fillRect(0,0,128,128);return new THREE.CanvasTexture(c)})()
const shadowSize={Camel:[3.2,2.2],Fox:[1.1,0.8],Lizard:[1.4,1.0],Scorpion:[1.2,0.9]}
export function CreatureManager(){const index=useStore(s=>s.currentDesertIndex),d=deserts[index];return <group>{d.creatures.map((type,i)=>{const C=map[type];if(!C)return null;const x=i*6-2,z=i*-5;const sc=type==='Camel'?1:type==='Fox'?2:3;const sh=shadowSize[type]||[1,1];return <group key={index+type} position={[x,getTerrainHeight(x,z,d.terrainParams),z]} rotation={[0,-.65,0]} scale={sc}><C position={[0,0,0]}/><mesh position={[0,0.03,0]} rotation={[-Math.PI/2,0,0.65]} renderOrder={1}><planeGeometry args={[sh[0],sh[1]]}/><meshBasicMaterial map={blobTexture} transparent depthWrite={false}/></mesh></group>})}</group>}
