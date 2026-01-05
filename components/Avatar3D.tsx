import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Environment, OrbitControls, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { EmoteType } from '../types';

const Primitive = 'primitive' as any;
const AmbientLight = 'ambientLight' as any;
const PointLight = 'pointLight' as any;
const SpotLight = 'spotLight' as any;

interface PoseDefinition {
  bones: {
    [boneKey: string]: { x: number; y: number; z: number };
  };
}

const d2r = (deg: number) => deg * (Math.PI / 180);

const EMOTE_LIBRARY: Record<EmoteType, PoseDefinition> = {
  [EmoteType.IDLE]: {
    bones: {
      leftUpperArm: { x: 0, y: 0, z: 80 },
      rightUpperArm: { x: 0, y: 0, z: -80 },
      leftLowerArm: { x: 0, y: 0, z: 5 },
      rightLowerArm: { x: 0, y: 0, z: -5 },
      head: { x: 0, y: 0, z: 0 },
    }
  },
  [EmoteType.TALKING]: {
    bones: {
      leftUpperArm: { x: 10, y: 0, z: 75 },
      rightUpperArm: { x: 10, y: 0, z: -75 },
      leftLowerArm: { x: 40, y: 0, z: 10 },
      rightLowerArm: { x: 40, y: 0, z: -10 },
    }
  },
  [EmoteType.HAPPY_GREETING]: {
    bones: {
      leftUpperArm: { x: 0, y: 0, z: 50 },
      rightUpperArm: { x: 0, y: 0, z: -140 },
      rightLowerArm: { x: 0, y: 0, z: -30 },
      head: { x: -5, y: 10, z: -5 },
    }
  },
  [EmoteType.AGREE]: {
    bones: {
       leftUpperArm: { x: 20, y: 0, z: 70 },
       rightUpperArm: { x: 20, y: 0, z: -70 },
       head: { x: 20, y: 0, z: 0 },
    }
  },
  [EmoteType.EXCITED]: {
    bones: {
       leftUpperArm: { x: -30, y: 0, z: 120 },
       rightUpperArm: { x: -30, y: 0, z: -120 },
       head: { x: -15, y: 0, z: 0 }, 
    }
  },
  [EmoteType.PROUD]: {
    bones: {
       chest: { x: -15, y: 0, z: 0 },
       leftUpperArm: { x: 0, y: 0, z: 60 },
       rightUpperArm: { x: 0, y: 0, z: -60 },
       head: { x: -15, y: 0, z: 0 }, 
    }
  },
  [EmoteType.GRATEFUL]: {
     bones: {
       leftUpperArm: { x: 30, y: 30, z: 50 },
       rightUpperArm: { x: 30, y: -30, z: -50 },
       leftLowerArm: { x: 90, y: 0, z: 0 }, 
       rightLowerArm: { x: 90, y: 0, z: 0 },
       head: { x: 10, y: 0, z: 0 }, 
    }
  },
  [EmoteType.LAUGHING]: {
     bones: {
       leftUpperArm: { x: 0, y: 0, z: 70 },
       rightUpperArm: { x: 0, y: 0, z: -70 },
       head: { x: -25, y: 0, z: 0 }, 
       chest: { x: 10, y: 0, z: 0 },
    }
  },
  [EmoteType.VICTORY]: {
     bones: {
       leftUpperArm: { x: 0, y: 0, z: 150 },
       rightUpperArm: { x: 0, y: 0, z: -150 },
       head: { x: -15, y: 0, z: 0 }, 
    }
  },
  [EmoteType.RELIEVED]: {
     bones: {
       leftUpperArm: { x: 0, y: 0, z: 80 },
       rightUpperArm: { x: 0, y: 0, z: -80 },
       head: { x: 15, y: 0, z: 0 }, 
       chest: { x: 5, y: 0, z: 0 }, 
    }
  },
  [EmoteType.HOPEFUL]: {
     bones: {
       leftUpperArm: { x: 20, y: 0, z: 70 },
       rightUpperArm: { x: 20, y: 0, z: -70 },
       head: { x: -15, y: 15, z: 0 }, 
    }
  },
  [EmoteType.AMUSED]: {
     bones: {
       leftUpperArm: { x: 0, y: 0, z: 75 },
       rightUpperArm: { x: 0, y: 0, z: -75 },
       head: { x: 5, y: -10, z: 5 }, 
    }
  },
  [EmoteType.THINKING]: {
    bones: {
      leftUpperArm: { x: 0, y: 0, z: 70 },
      rightUpperArm: { x: 60, y: -30, z: -30 }, 
      rightLowerArm: { x: 120, y: 0, z: 0 },
      head: { x: 10, y: 0, z: -10 },
    }
  },
  [EmoteType.CURIOUS]: {
     bones: {
       leftUpperArm: { x: 0, y: 0, z: 70 },
       rightUpperArm: { x: 0, y: 0, z: -70 },
       head: { x: 5, y: 0, z: 20 }, 
    }
  },
  [EmoteType.LISTENING]: {
     bones: {
       leftUpperArm: { x: 0, y: 0, z: 75 },
       rightUpperArm: { x: 0, y: 0, z: -75 },
       head: { x: 0, y: 0, z: 0 }, 
       chest: { x: 5, y: 0, z: 0 }, 
    }
  },
  [EmoteType.EXPLAINING]: {
     bones: {
       leftUpperArm: { x: 30, y: 0, z: 60 },
       rightUpperArm: { x: 30, y: 0, z: -60 },
       leftLowerArm: { x: 40, y: 0, z: 0 },
       rightLowerArm: { x: 40, y: 0, z: 0 },
    }
  },
  [EmoteType.CONTEMPLATING]: {
     bones: {
       leftUpperArm: { x: 0, y: 0, z: 75 },
       rightUpperArm: { x: 0, y: 0, z: -75 },
       head: { x: 15, y: 0, z: 0 }, 
    }
  },
  [EmoteType.OBSERVING]: {
     bones: {
       leftUpperArm: { x: 0, y: 0, z: 75 },
       rightUpperArm: { x: 0, y: 0, z: -75 },
       head: { x: 0, y: 0, z: 0 }, 
    }
  },
  [EmoteType.SERIOUS]: {
     bones: {
       leftUpperArm: { x: 0, y: 0, z: 75 },
       rightUpperArm: { x: 0, y: 0, z: -75 },
       head: { x: 5, y: 0, z: 0 }, 
    }
  },
  [EmoteType.MYSTERIOUS]: {
     bones: {
       leftUpperArm: { x: 0, y: 0, z: 75 },
       rightUpperArm: { x: 0, y: 0, z: -75 },
       head: { x: 5, y: 10, z: 0 }, 
    }
  },
  [EmoteType.ANGRY]: {
    bones: {
      leftUpperArm: { x: 0, y: 0, z: 80 },
      rightUpperArm: { x: 0, y: 0, z: -80 },
      head: { x: 10, y: 0, z: 0 },
    }
  },
  [EmoteType.DISAGREE]: {
     bones: {
       leftUpperArm: { x: 0, y: 0, z: 60 }, 
       rightUpperArm: { x: 0, y: 0, z: -60 },
       head: { x: 0, y: 20, z: 0 }, 
    }
  },
  [EmoteType.SHOCKED]: {
     bones: {
       leftUpperArm: { x: 0, y: 0, z: 100 },
       rightUpperArm: { x: 0, y: 0, z: -100 },
       head: { x: -15, y: 0, z: 0 }, 
    }
  },
  [EmoteType.SAD]: {
     bones: {
       leftUpperArm: { x: 0, y: 0, z: 85 },
       rightUpperArm: { x: 0, y: 0, z: -85 },
       head: { x: 25, y: 0, z: 0 },
       chest: { x: 20, y: 0, z: 0 }, 
    }
  },
  [EmoteType.DISAPPOINTED]: {
     bones: {
       leftUpperArm: { x: 0, y: 0, z: 80 },
       rightUpperArm: { x: 0, y: 0, z: -80 },
       head: { x: 15, y: 15, z: 5 }, 
    }
  },
  [EmoteType.SKEPTICAL]: {
     bones: {
       leftUpperArm: { x: 0, y: 0, z: 75 },
       rightUpperArm: { x: 0, y: 0, z: -75 },
       head: { x: 0, y: 0, z: 15 }, 
    }
  },
  [EmoteType.ANNOYED]: {
     bones: {
       leftUpperArm: { x: 0, y: 0, z: 80 },
       rightUpperArm: { x: 0, y: 0, z: -80 },
       head: { x: 0, y: 25, z: 0 }, 
    }
  },
  [EmoteType.FEARFUL]: {
     bones: {
       leftUpperArm: { x: 30, y: 30, z: 80 },
       rightUpperArm: { x: 30, y: -30, z: -80 },
       head: { x: -10, y: 0, z: 0 }, 
    }
  },
  [EmoteType.ARROGANT]: {
     bones: {
       leftUpperArm: { x: 0, y: 0, z: 70 },
       rightUpperArm: { x: 0, y: 0, z: -70 },
       head: { x: -20, y: 20, z: 0 }, 
    }
  },
  [EmoteType.CONFUSED]: {
     bones: {
       leftUpperArm: { x: 0, y: 0, z: 75 },
       rightUpperArm: { x: 0, y: 0, z: -75 },
       head: { x: 5, y: 0, z: 25 },
    }
  }
};

const AvatarModel = ({ url, emote, setBoundingBox }: { url: string, emote: EmoteType, setBoundingBox: (box: THREE.Box3) => void }) => {
  const { scene, animations } = useGLTF(url);
  const clone = useMemo(() => scene.clone(), [scene]);
  const { actions } = useAnimations(animations, clone);
  const [hasBuiltInAnimation, setHasBuiltInAnimation] = useState(false);
  
  // Calculate Bounding Box once on load
  useEffect(() => {
    const box = new THREE.Box3().setFromObject(clone);
    setBoundingBox(box);
  }, [clone, setBoundingBox]);

  // Handle Built-in GLB Animations
  useEffect(() => {
    if (actions && Object.keys(actions).length > 0) {
        const firstAnim = Object.keys(actions)[0];
        actions[firstAnim]?.reset().fadeIn(0.5).play();
        setHasBuiltInAnimation(true);
        return () => {
            actions[firstAnim]?.fadeOut(0.5);
        };
    }
  }, [actions]);

  // Procedural Bone Mapping
  const boneMap = useRef<Record<string, THREE.Bone | null>>({});

  useEffect(() => {
    boneMap.current = {};
    clone.traverse((obj) => {
      if ((obj as THREE.Bone).isBone) {
        const rawName = obj.name.toLowerCase();
        let name = rawName;
        if (name.includes(':')) name = name.split(':').pop() || name;
        if (name.includes('j_bip_')) name = name.replace('j_bip_', '');
        if (name.includes('c_')) name = name.replace('c_', '');

        if (name.includes('head')) boneMap.current.head = obj as THREE.Bone;
        else if (name.includes('neck')) boneMap.current.neck = obj as THREE.Bone;
        else if (name.includes('chest') || name.includes('spine')) boneMap.current.chest = obj as THREE.Bone;
        else if (name.includes('hips') || name.includes('pelvis')) boneMap.current.hips = obj as THREE.Bone;
        
        else if ((name.includes('left') || name.includes('_l_')) && (name.includes('arm') || name.includes('shoulder')) && !name.includes('lower') && !name.includes('fore')) boneMap.current.leftUpperArm = obj as THREE.Bone;
        else if ((name.includes('left') || name.includes('_l_')) && (name.includes('lower') || name.includes('fore'))) boneMap.current.leftLowerArm = obj as THREE.Bone;
        else if ((name.includes('right') || name.includes('_r_')) && (name.includes('arm') || name.includes('shoulder')) && !name.includes('lower') && !name.includes('fore')) boneMap.current.rightUpperArm = obj as THREE.Bone;
        else if ((name.includes('right') || name.includes('_r_')) && (name.includes('lower') || name.includes('fore'))) boneMap.current.rightLowerArm = obj as THREE.Bone;
      }
    });
  }, [clone]);

  useFrame((state, delta) => {
    // If GLB has animation, skip procedural rotation to avoid conflict
    if (hasBuiltInAnimation) return;

    const targetPose = EMOTE_LIBRARY[emote] || EMOTE_LIBRARY[EmoteType.IDLE];
    const speed = 5.0 * delta;
    const time = state.clock.getElapsedTime();

    Object.keys(targetPose.bones).forEach(key => {
      const bone = boneMap.current[key];
      if (bone) {
        const targetRot = targetPose.bones[key];
        const breathY = Math.sin(time * 2.5) * 2; 
        const breathZ = Math.cos(time * 2.5) * 1;
        const isArm = key.includes('Arm');

        let talkX = 0;
        if (emote === EmoteType.TALKING && key === 'head') {
            talkX = Math.sin(time * 18) * 5; 
        }
        
        const finalX = d2r(targetRot.x + talkX);
        const finalY = d2r(targetRot.y + (isArm ? breathY : 0));
        const finalZ = d2r(targetRot.z + (isArm ? breathZ : 0));

        bone.rotation.x = THREE.MathUtils.lerp(bone.rotation.x, finalX, speed);
        bone.rotation.y = THREE.MathUtils.lerp(bone.rotation.y, finalY, speed);
        bone.rotation.z = THREE.MathUtils.lerp(bone.rotation.z, finalZ, speed);
      }
    });
  });

  return <Primitive object={clone} />;
};

// Component to handle automatic camera positioning based on model size
const AutoCamera = ({ bounds }: { bounds: THREE.Box3 | null }) => {
    const { camera, controls } = useThree();
    const initialized = useRef(false);

    useEffect(() => {
        if (bounds && !initialized.current) {
            const size = new THREE.Vector3();
            bounds.getSize(size);
            const center = new THREE.Vector3();
            bounds.getCenter(center);
            
            // Assume head is near the top (90% of max Y)
            const headHeight = bounds.max.y * 0.9;
            
            // Set Target to Head
            if (controls) {
                // @ts-ignore
                controls.target.set(0, headHeight, 0);
                // @ts-ignore
                controls.update();
            }

            // Position Camera at Head Level, zoomed out slightly
            // Standard Portrait Shot distance
            camera.position.set(0, headHeight, 2.0);
            camera.lookAt(0, headHeight, 0);
            
            initialized.current = true;
        }
    }, [bounds, camera, controls]);

    return null;
};

interface Avatar3DProps {
  vrmUrl: string;
  animationState: EmoteType;
}

const Avatar3D: React.FC<Avatar3DProps> = ({ vrmUrl, animationState }) => {
  const [bounds, setBounds] = useState<THREE.Box3 | null>(null);

  return (
    <div className="w-full h-full min-h-[400px] bg-gradient-to-b from-gray-900 to-black rounded-lg overflow-hidden relative shadow-2xl border border-gray-800">
        <Canvas>
          <AmbientLight intensity={2.0} />
          <PointLight position={[10, 10, 10]} intensity={1} />
          <SpotLight position={[0, 5, 5]} intensity={0.5} angle={0.5} penumbra={1} />
          
          <AvatarModel 
            url={vrmUrl} 
            emote={animationState} 
            setBoundingBox={setBounds} 
          />
          
          <AutoCamera bounds={bounds} />

          <Environment preset="city" />
          <OrbitControls 
            enablePan={true} 
            minPolarAngle={Math.PI / 3} 
            maxPolarAngle={Math.PI / 1.8}
            enableZoom={true}
            minDistance={0.5}
            maxDistance={5.0}
          />
        </Canvas>
        
        <div className="absolute top-4 right-4 flex gap-2">
            <div className="bg-black/60 px-3 py-1.5 rounded-full text-xs text-white backdrop-blur-md border border-white/10 shadow-lg flex items-center gap-2">
               <div className={`w-2 h-2 rounded-full ${animationState === EmoteType.TALKING ? 'bg-green-500 animate-pulse' : 'bg-blue-400'}`}></div>
               {animationState.replace('_', ' ')}
            </div>
        </div>
    </div>
  );
};

export default Avatar3D;
