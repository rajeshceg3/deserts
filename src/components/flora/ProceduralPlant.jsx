import React, { useMemo, useRef, useEffect } from 'react'
import * as THREE from 'three'

// Simple materials for now, could be improved
const PlantMaterial = ({ color, ...props }) => (
  <meshStandardMaterial color={color} roughness={0.8} side={THREE.DoubleSide} {...props} />
)

const ProceduralPlantGroup = ({ type, instances }) => {
    if (!instances || instances.length === 0) return null;

    const dummy = useMemo(() => new THREE.Object3D(), []);
    const tempColor = useMemo(() => new THREE.Color(), []);

    // Fern definition
    const FernGroup = () => {
        const leafRef = useRef();
        useEffect(() => {
            if (leafRef.current) {
                for (let i = 0; i < instances.length; i++) {
                    const inst = instances[i];
                    for (let j = 0; j < 5; j++) {
                        const idx = i * 5 + j;
                        dummy.position.set(...inst.position);
                        dummy.rotation.set(...inst.rotation);
                        dummy.scale.setScalar(inst.scale);

                        // Local transforms for each leaf
                        const localYRot = (j / 5) * Math.PI * 2;
                        dummy.rotateY(localYRot);
                        dummy.translateY(0.5);
                        dummy.translateX(0.2);
                        dummy.rotateZ(-0.5);

                        dummy.updateMatrix();
                        leafRef.current.setMatrixAt(idx, dummy.matrix);
                        tempColor.set(inst.color);
                        leafRef.current.setColorAt(idx, tempColor);
                    }
                }
                leafRef.current.instanceMatrix.needsUpdate = true;
                if(leafRef.current.instanceColor) leafRef.current.instanceColor.needsUpdate = true;
            }
        }, [instances]);

        return (
            <instancedMesh ref={leafRef} args={[null, null, instances.length * 5]} castShadow receiveShadow>
                <planeGeometry args={[0.3, 1.2, 2, 2]} />
                <meshStandardMaterial roughness={0.8} side={THREE.DoubleSide} />
            </instancedMesh>
        );
    };

    // Flower definition
    const FlowerGroup = () => {
        const stemRef = useRef();
        const headRef = useRef();
        useEffect(() => {
            if (stemRef.current && headRef.current) {
                for (let i = 0; i < instances.length; i++) {
                    const inst = instances[i];
                    // Stem
                    dummy.position.set(...inst.position);
                    dummy.rotation.set(...inst.rotation);
                    dummy.scale.setScalar(inst.scale);
                    dummy.translateY(0.4);
                    dummy.updateMatrix();
                    stemRef.current.setMatrixAt(i, dummy.matrix);

                    // Head
                    dummy.position.set(...inst.position);
                    dummy.rotation.set(...inst.rotation);
                    dummy.scale.setScalar(inst.scale);
                    dummy.translateY(0.8);
                    dummy.updateMatrix();
                    headRef.current.setMatrixAt(i, dummy.matrix);

                    tempColor.set(inst.color);
                    headRef.current.setColorAt(i, tempColor);
                }
                stemRef.current.instanceMatrix.needsUpdate = true;
                headRef.current.instanceMatrix.needsUpdate = true;
                if(headRef.current.instanceColor) headRef.current.instanceColor.needsUpdate = true;
            }
        }, [instances]);

        return (
            <group>
                <instancedMesh ref={stemRef} args={[null, null, instances.length]} castShadow receiveShadow>
                    <cylinderGeometry args={[0.02, 0.02, 0.8, 4]} />
                    <meshStandardMaterial color="#556b2f" roughness={0.8} />
                </instancedMesh>
                <instancedMesh ref={headRef} args={[null, null, instances.length]}>
                    <sphereGeometry args={[0.15, 6, 6]} />
                    {/* Note: emissive from instance color isn't perfectly supported natively, but base color works */}
                    <meshStandardMaterial emissiveIntensity={0.2} roughness={0.8} />
                </instancedMesh>
            </group>
        );
    };

    // Grass definition
    const GrassGroup = () => {
        const grassRef = useRef();

        // Use useMemo to ensure reproducible random offsets for the grass blades per instance
        const bladesConfig = useMemo(() => {
            return instances.map(() => {
                return Array(10).fill(0).map(() => ({
                    posOffset: [(Math.random()-0.5)*0.5, 0.3, (Math.random()-0.5)*0.5],
                    rotOffset: [Math.random()*0.2, Math.random()*Math.PI, Math.random()*0.2],
                    scaleOffset: 0.6 + Math.random()*0.3
                }));
            });
        }, [instances]);

        useEffect(() => {
            if (grassRef.current) {
                for (let i = 0; i < instances.length; i++) {
                    const inst = instances[i];
                    for (let j = 0; j < 10; j++) {
                        const idx = i * 10 + j;
                        const blade = bladesConfig[i][j];

                        dummy.position.set(...inst.position);
                        dummy.rotation.set(...inst.rotation);
                        dummy.scale.setScalar(inst.scale);

                        // Apply blade specific local transforms
                        dummy.translateX(blade.posOffset[0]);
                        dummy.translateY(blade.posOffset[1]);
                        dummy.translateZ(blade.posOffset[2]);

                        dummy.rotateX(blade.rotOffset[0]);
                        dummy.rotateY(blade.rotOffset[1]);
                        dummy.rotateZ(blade.rotOffset[2]);

                        // Non-uniform scale adjustment based on grass height
                        dummy.scale.y *= blade.scaleOffset;

                        dummy.updateMatrix();
                        grassRef.current.setMatrixAt(idx, dummy.matrix);
                        tempColor.set(inst.color);
                        grassRef.current.setColorAt(idx, tempColor);
                    }
                }
                grassRef.current.instanceMatrix.needsUpdate = true;
                if(grassRef.current.instanceColor) grassRef.current.instanceColor.needsUpdate = true;
            }
        }, [instances, bladesConfig]);

        return (
            <instancedMesh ref={grassRef} args={[null, null, instances.length * 10]} receiveShadow>
                {/* normalized height cone so y scale behaves nicely */}
                <coneGeometry args={[0.02, 1, 3]} />
                <meshStandardMaterial roughness={0.8} />
            </instancedMesh>
        );
    };

    // Moss definition
    const MossGroup = () => {
        const baseRef = useRef();
        const bumpRef = useRef();

        const mossConfig = useMemo(() => {
             return instances.map(() => {
                 return {
                     baseScale: 0.5 + Math.random()*0.3,
                     bumps: Array(5).fill(0).map(() => ({
                         posOffset: [(Math.random()-0.5)*0.6, 0.05, (Math.random()-0.5)*0.6],
                         scaleOffset: 0.1 + Math.random()*0.1
                     }))
                 }
             });
        }, [instances]);

        useEffect(() => {
            if (baseRef.current && bumpRef.current) {
                for (let i = 0; i < instances.length; i++) {
                    const inst = instances[i];
                    const cfg = mossConfig[i];

                    // Base
                    dummy.position.set(...inst.position);
                    dummy.rotation.set(...inst.rotation);
                    dummy.scale.setScalar(inst.scale);
                    dummy.translateY(0.02);
                    dummy.rotateX(-Math.PI/2);
                    dummy.scale.setScalar(cfg.baseScale * inst.scale);
                    dummy.updateMatrix();
                    baseRef.current.setMatrixAt(i, dummy.matrix);
                    tempColor.set(inst.color);
                    baseRef.current.setColorAt(i, tempColor);

                    // Bumps
                    for (let j = 0; j < 5; j++) {
                        const idx = i * 5 + j;
                        const bump = cfg.bumps[j];
                        dummy.position.set(...inst.position);
                        dummy.rotation.set(...inst.rotation);
                        dummy.scale.setScalar(inst.scale);

                        dummy.translateX(bump.posOffset[0]);
                        dummy.translateY(bump.posOffset[1]);
                        dummy.translateZ(bump.posOffset[2]);
                        dummy.scale.setScalar(bump.scaleOffset * inst.scale);

                        dummy.updateMatrix();
                        bumpRef.current.setMatrixAt(idx, dummy.matrix);
                        bumpRef.current.setColorAt(idx, tempColor);
                    }
                }
                baseRef.current.instanceMatrix.needsUpdate = true;
                bumpRef.current.instanceMatrix.needsUpdate = true;
                if(baseRef.current.instanceColor) baseRef.current.instanceColor.needsUpdate = true;
                if(bumpRef.current.instanceColor) bumpRef.current.instanceColor.needsUpdate = true;
            }
        }, [instances, mossConfig]);

        return (
            <group>
                <instancedMesh ref={baseRef} args={[null, null, instances.length]} receiveShadow>
                    <circleGeometry args={[1, 8]} />
                    <meshStandardMaterial roughness={1.0} />
                </instancedMesh>
                <instancedMesh ref={bumpRef} args={[null, null, instances.length * 5]}>
                    <sphereGeometry args={[1, 4, 4]} />
                    <meshStandardMaterial roughness={0.8} />
                </instancedMesh>
            </group>
        );
    };

    // Bush definition
    const BushGroup = () => {
        const leavesRef = useRef();
        const trunkRef = useRef();

        const bushConfig = useMemo(() => {
            return instances.map(() => {
                return Array(4).fill(0).map(() => ({
                    posOffset: [(Math.random()-0.5)*0.5, 0.3 + Math.random()*0.3, (Math.random()-0.5)*0.5],
                    scaleOffset: 0.3 + Math.random()*0.2
                }));
            });
        }, [instances]);

        useEffect(() => {
            if (leavesRef.current && trunkRef.current) {
                for (let i = 0; i < instances.length; i++) {
                    const inst = instances[i];

                    // Trunk
                    dummy.position.set(...inst.position);
                    dummy.rotation.set(...inst.rotation);
                    dummy.scale.setScalar(inst.scale);
                    dummy.translateY(0.2);
                    dummy.updateMatrix();
                    trunkRef.current.setMatrixAt(i, dummy.matrix);

                    // Leaves
                    for (let j = 0; j < 4; j++) {
                        const idx = i * 4 + j;
                        const leaf = bushConfig[i][j];

                        dummy.position.set(...inst.position);
                        dummy.rotation.set(...inst.rotation);
                        dummy.scale.setScalar(inst.scale);

                        dummy.translateX(leaf.posOffset[0]);
                        dummy.translateY(leaf.posOffset[1]);
                        dummy.translateZ(leaf.posOffset[2]);
                        dummy.scale.setScalar(leaf.scaleOffset * inst.scale);

                        dummy.updateMatrix();
                        leavesRef.current.setMatrixAt(idx, dummy.matrix);
                        tempColor.set(inst.color);
                        leavesRef.current.setColorAt(idx, tempColor);
                    }
                }
                trunkRef.current.instanceMatrix.needsUpdate = true;
                leavesRef.current.instanceMatrix.needsUpdate = true;
                if(leavesRef.current.instanceColor) leavesRef.current.instanceColor.needsUpdate = true;
            }
        }, [instances, bushConfig]);

        return (
            <group>
                <instancedMesh ref={trunkRef} args={[null, null, instances.length]} castShadow receiveShadow>
                    <cylinderGeometry args={[0.05, 0.08, 0.5, 4]} />
                    <meshStandardMaterial color="#3e2723" roughness={0.8} />
                </instancedMesh>
                <instancedMesh ref={leavesRef} args={[null, null, instances.length * 4]} castShadow receiveShadow>
                    <sphereGeometry args={[1, 6, 6]} />
                    <meshStandardMaterial roughness={0.8} />
                </instancedMesh>
            </group>
        );
    };

    // Succulent definition
    const SucculentGroup = () => {
        const leafRef = useRef();
        const centerRef = useRef();
        useEffect(() => {
            if (leafRef.current && centerRef.current) {
                for (let i = 0; i < instances.length; i++) {
                    const inst = instances[i];

                    // Center
                    dummy.position.set(...inst.position);
                    dummy.rotation.set(...inst.rotation);
                    dummy.scale.setScalar(inst.scale);
                    dummy.translateY(0.2);
                    dummy.updateMatrix();
                    centerRef.current.setMatrixAt(i, dummy.matrix);
                    tempColor.set(inst.color);
                    centerRef.current.setColorAt(i, tempColor);

                    // Outer leaves
                    for (let j = 0; j < 8; j++) {
                        const idx = i * 8 + j;
                        const angle = (j / 8) * Math.PI * 2;

                        dummy.position.set(...inst.position);
                        dummy.rotation.set(...inst.rotation);
                        dummy.scale.setScalar(inst.scale);

                        dummy.translateY(0.1);
                        dummy.rotateY(angle);
                        dummy.rotateX(0.5); // Tilt outwards

                        dummy.updateMatrix();
                        leafRef.current.setMatrixAt(idx, dummy.matrix);
                        leafRef.current.setColorAt(idx, tempColor);
                    }
                }
                centerRef.current.instanceMatrix.needsUpdate = true;
                leafRef.current.instanceMatrix.needsUpdate = true;
                if(centerRef.current.instanceColor) centerRef.current.instanceColor.needsUpdate = true;
                if(leafRef.current.instanceColor) leafRef.current.instanceColor.needsUpdate = true;
            }
        }, [instances]);

        return (
            <group>
                <instancedMesh ref={centerRef} args={[null, null, instances.length]} castShadow receiveShadow>
                    <coneGeometry args={[0.12, 0.4, 4]} />
                    <meshStandardMaterial roughness={0.8} />
                </instancedMesh>
                <instancedMesh ref={leafRef} args={[null, null, instances.length * 8]}>
                    <coneGeometry args={[0.1, 0.5, 4]} />
                    <meshStandardMaterial roughness={0.4} />
                </instancedMesh>
            </group>
        );
    };

    // Crystal definition
    const CrystalGroup = () => {
        const mainRef = useRef();
        const shardRef = useRef();
        useEffect(() => {
            if (mainRef.current && shardRef.current) {
                for (let i = 0; i < instances.length; i++) {
                    const inst = instances[i];

                    // Main crystal
                    dummy.position.set(...inst.position);
                    dummy.rotation.set(...inst.rotation);
                    dummy.scale.setScalar(inst.scale);
                    dummy.translateY(0.5);
                    dummy.updateMatrix();
                    mainRef.current.setMatrixAt(i, dummy.matrix);
                    tempColor.set(inst.color);
                    mainRef.current.setColorAt(i, tempColor);

                    // Side shard
                    dummy.position.set(...inst.position);
                    dummy.rotation.set(...inst.rotation);
                    dummy.scale.setScalar(inst.scale);
                    dummy.translateX(0.2);
                    dummy.translateY(0.3);
                    dummy.rotateZ(-0.3);
                    dummy.updateMatrix();
                    shardRef.current.setMatrixAt(i, dummy.matrix);
                    shardRef.current.setColorAt(i, tempColor);
                }
                mainRef.current.instanceMatrix.needsUpdate = true;
                shardRef.current.instanceMatrix.needsUpdate = true;
                if(mainRef.current.instanceColor) mainRef.current.instanceColor.needsUpdate = true;
                if(shardRef.current.instanceColor) shardRef.current.instanceColor.needsUpdate = true;
            }
        }, [instances]);

        return (
            <group>
                <instancedMesh ref={mainRef} args={[null, null, instances.length]} castShadow receiveShadow>
                    <cylinderGeometry args={[0, 0.2, 1, 4]} />
                    <meshPhysicalMaterial transmission={0.6} roughness={0.1} metalness={0.1} thickness={0.5} />
                </instancedMesh>
                <instancedMesh ref={shardRef} args={[null, null, instances.length]} castShadow receiveShadow>
                    <cylinderGeometry args={[0, 0.1, 0.6, 4]} />
                    <meshPhysicalMaterial transmission={0.6} roughness={0.1} metalness={0.1} thickness={0.3} />
                </instancedMesh>
            </group>
        );
    };

    switch(type) {
        case 'Fern': return <FernGroup />;
        case 'Flower': return <FlowerGroup />;
        case 'Grass': return <GrassGroup />;
        case 'Moss': return <MossGroup />;
        case 'Bush': return <BushGroup />;
        case 'Succulent': return <SucculentGroup />;
        case 'Crystal': return <CrystalGroup />;
        default: return <BushGroup />;
    }
}

export const ProceduralPlant = ({ type, instances }) => {
    return <ProceduralPlantGroup type={type} instances={instances} />;
}
