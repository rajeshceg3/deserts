import React from 'react'
import {Camel} from './creatures/Camel'
import {Fox} from './creatures/Fox'
import {Lizard} from './creatures/Lizard'
import {Scorpion} from './creatures/Scorpion'
import {useStore} from '../store'
import {deserts} from '../data/deserts'
import {getTerrainHeight} from '../utils/terrainUtils'
const map={Camel,Fox,Lizard,Scorpion}
export function CreatureManager(){const index=useStore(s=>s.currentDesertIndex),d=deserts[index];return <group>{d.creatures.map((type,i)=>{const C=map[type];if(!C)return null;const x=i*6-2,z=i*-5;return <group key={index+type} position={[x,getTerrainHeight(x,z,d.terrainParams),z]} rotation={[0,-.65,0]} scale={type==='Camel'?1:type==='Fox'?2:3}><C position={[0,0,0]}/></group>})}</group>}
