import React, { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { useGLTF, Environment, OrbitControls, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRM, VRMHumanBoneName } from '@pixiv/three-vrm';
import { EmoteType, IDLE_EMOTES } from '../types';

const Primitive = 'primitive' as any;
const AmbientLight = 'ambientLight' as any;
const PointLight = 'pointLight' as any;
const SpotLight = 'spotLight' as any;
const DirectionalLight = 'directionalLight' as any;

interface PoseDefinition {
  bones: {
    [boneKey: string]: { x: number; y: number; z: number };
  };
}

const d2r = (deg: number) => deg * (Math.PI / 180);

// Map our bone keys to VRM humanoid bone names
const BONE_MAP: Record<string, VRMHumanBoneName> = {
  head: VRMHumanBoneName.Head,
  neck: VRMHumanBoneName.Neck,
  chest: VRMHumanBoneName.Chest,
  spine: VRMHumanBoneName.Spine,
  hips: VRMHumanBoneName.Hips,
  leftUpperArm: VRMHumanBoneName.LeftUpperArm,
  leftLowerArm: VRMHumanBoneName.LeftLowerArm,
  rightUpperArm: VRMHumanBoneName.RightUpperArm,
  rightLowerArm: VRMHumanBoneName.RightLowerArm,
  leftHand: VRMHumanBoneName.LeftHand,
  rightHand: VRMHumanBoneName.RightHand,
};

// 50+ Emote animations with detailed body poses
const EMOTE_LIBRARY: Record<EmoteType, PoseDefinition> = {
  // === IDLE STATES ===
  [EmoteType.IDLE]: {
    bones: {
      leftUpperArm: { x: 0, y: 0, z: 30 },
      rightUpperArm: { x: 0, y: 0, z: -30 },
      leftLowerArm: { x: 0, y: 0, z: -5 },
      rightLowerArm: { x: 0, y: 0, z: 5 },
      head: { x: 0, y: 0, z: 0 },
      chest: { x: 0, y: 0, z: 0 },
    }
  },
  [EmoteType.IDLE_RELAXED]: {
    bones: {
      leftUpperArm: { x: 0, y: 0, z: 35 },
      rightUpperArm: { x: 0, y: 0, z: -35 },
      leftLowerArm: { x: -10, y: 0, z: -8 },
      rightLowerArm: { x: -10, y: 0, z: 8 },
      head: { x: 5, y: 0, z: 0 },
      chest: { x: 3, y: 0, z: 0 },
    }
  },
  [EmoteType.IDLE_ATTENTIVE]: {
    bones: {
      leftUpperArm: { x: 0, y: 0, z: 28 },
      rightUpperArm: { x: 0, y: 0, z: -28 },
      head: { x: -5, y: 0, z: 0 },
      chest: { x: -3, y: 0, z: 0 },
    }
  },
  [EmoteType.IDLE_CURIOUS]: {
    bones: {
      leftUpperArm: { x: 0, y: 0, z: 30 },
      rightUpperArm: { x: 0, y: 0, z: -30 },
      head: { x: 0, y: 10, z: 0 },
    }
  },

  // === SPEAKING STATES ===
  [EmoteType.TALKING]: {
    bones: {
      leftUpperArm: { x: 0, y: 0, z: 25 },
      rightUpperArm: { x: 0, y: 0, z: -25 },
      leftLowerArm: { x: -25, y: 0, z: -5 },
      rightLowerArm: { x: -25, y: 0, z: 5 },
      head: { x: 0, y: 0, z: 0 },
    }
  },
  [EmoteType.TALKING_EXCITED]: {
    bones: {
      leftUpperArm: { x: 0, y: 0, z: 20 },
      rightUpperArm: { x: 0, y: 0, z: -20 },
      leftLowerArm: { x: -40, y: 0, z: -8 },
      rightLowerArm: { x: -40, y: 0, z: 8 },
      head: { x: -10, y: 0, z: 0 },
      chest: { x: -5, y: 0, z: 0 },
    }
  },
  [EmoteType.TALKING_CALM]: {
    bones: {
      leftUpperArm: { x: 0, y: 0, z: 32 },
      rightUpperArm: { x: 0, y: 0, z: -32 },
      leftLowerArm: { x: -18, y: 0, z: -3 },
      rightLowerArm: { x: -18, y: 0, z: 3 },
      head: { x: 5, y: 0, z: 0 },
    }
  },

  // === POSITIVE EMOTIONS ===
  [EmoteType.HAPPY]: {
    bones: {
      leftUpperArm: { x: 0, y: 0, z: 25 },
      rightUpperArm: { x: 0, y: 0, z: -25 },
      head: { x: -8, y: 5, z: 0 },
      chest: { x: -5, y: 0, z: 0 },
    }
  },
  [EmoteType.HAPPY_GREETING]: {
    bones: {
      leftUpperArm: { x: 0, y: 0, z: 30 },
      rightUpperArm: { x: -90, y: 0, z: -60 },
      rightLowerArm: { x: -20, y: 0, z: 0 },
      head: { x: -5, y: 10, z: -5 },
    }
  },
  [EmoteType.JOYFUL]: {
    bones: {
      leftUpperArm: { x: -30, y: 0, z: 45 },
      rightUpperArm: { x: -30, y: 0, z: -45 },
      head: { x: -15, y: 0, z: 0 },
      chest: { x: -10, y: 0, z: 0 },
    }
  },
  [EmoteType.EXCITED]: {
    bones: {
      leftUpperArm: { x: -50, y: 0, z: 50 },
      rightUpperArm: { x: -50, y: 0, z: -50 },
      head: { x: -15, y: 0, z: 0 },
      chest: { x: -8, y: 0, z: 0 },
    }
  },
  [EmoteType.ENTHUSIASTIC]: {
    bones: {
      leftUpperArm: { x: -40, y: 0, z: 45 },
      rightUpperArm: { x: -40, y: 0, z: -45 },
      leftLowerArm: { x: -30, y: 0, z: 0 },
      rightLowerArm: { x: -30, y: 0, z: 0 },
      head: { x: -10, y: 0, z: 0 },
    }
  },
  [EmoteType.PROUD]: {
    bones: {
      chest: { x: -15, y: 0, z: 0 },
      leftUpperArm: { x: 0, y: 0, z: 20 },
      rightUpperArm: { x: 0, y: 0, z: -20 },
      head: { x: -10, y: 0, z: 0 },
    }
  },
  [EmoteType.GRATEFUL]: {
    bones: {
      leftUpperArm: { x: -30, y: 30, z: 30 },
      rightUpperArm: { x: -30, y: -30, z: -30 },
      leftLowerArm: { x: -85, y: 0, z: 0 },
      rightLowerArm: { x: -85, y: 0, z: 0 },
      head: { x: 12, y: 0, z: 0 },
      chest: { x: 5, y: 0, z: 0 },
    }
  },
  [EmoteType.THANKFUL]: {
    bones: {
      leftUpperArm: { x: -25, y: 25, z: 35 },
      rightUpperArm: { x: -25, y: -25, z: -35 },
      leftLowerArm: { x: -80, y: 0, z: 0 },
      rightLowerArm: { x: -80, y: 0, z: 0 },
      head: { x: 15, y: 0, z: 0 },
    }
  },
  [EmoteType.LAUGHING]: {
    bones: {
      leftUpperArm: { x: 0, y: 0, z: 28 },
      rightUpperArm: { x: 0, y: 0, z: -28 },
      head: { x: -20, y: 0, z: 0 },
      chest: { x: 12, y: 0, z: 0 },
    }
  },
  [EmoteType.AMUSED]: {
    bones: {
      leftUpperArm: { x: 0, y: 0, z: 30 },
      rightUpperArm: { x: 0, y: 0, z: -30 },
      head: { x: 5, y: -8, z: 5 },
    }
  },
  [EmoteType.PLAYFUL]: {
    bones: {
      leftUpperArm: { x: -20, y: 0, z: 35 },
      rightUpperArm: { x: -20, y: 0, z: -35 },
      head: { x: -5, y: 15, z: 8 },
    }
  },
  [EmoteType.RELIEVED]: {
    bones: {
      leftUpperArm: { x: 0, y: 0, z: 35 },
      rightUpperArm: { x: 0, y: 0, z: -35 },
      head: { x: 18, y: 0, z: 0 },
      chest: { x: 8, y: 0, z: 0 },
    }
  },
  [EmoteType.HOPEFUL]: {
    bones: {
      leftUpperArm: { x: 0, y: 0, z: 28 },
      rightUpperArm: { x: 0, y: 0, z: -28 },
      head: { x: -12, y: 10, z: 0 },
    }
  },
  [EmoteType.OPTIMISTIC]: {
    bones: {
      leftUpperArm: { x: -15, y: 0, z: 30 },
      rightUpperArm: { x: -15, y: 0, z: -30 },
      head: { x: -10, y: 5, z: 0 },
      chest: { x: -5, y: 0, z: 0 },
    }
  },
  [EmoteType.LOVING]: {
    bones: {
      leftUpperArm: { x: -20, y: 20, z: 30 },
      rightUpperArm: { x: -20, y: -20, z: -30 },
      leftLowerArm: { x: -70, y: 0, z: 0 },
      rightLowerArm: { x: -70, y: 0, z: 0 },
      head: { x: 10, y: 0, z: 5 },
      chest: { x: 3, y: 0, z: 0 },
    }
  },
  [EmoteType.WARM]: {
    bones: {
      leftUpperArm: { x: 0, y: 0, z: 28 },
      rightUpperArm: { x: 0, y: 0, z: -28 },
      head: { x: 5, y: 5, z: 0 },
    }
  },
  [EmoteType.CONTENT]: {
    bones: {
      leftUpperArm: { x: 0, y: 0, z: 32 },
      rightUpperArm: { x: 0, y: 0, z: -32 },
      head: { x: 8, y: 0, z: 0 },
      chest: { x: 3, y: 0, z: 0 },
    }
  },
  [EmoteType.SATISFIED]: {
    bones: {
      leftUpperArm: { x: 0, y: 0, z: 30 },
      rightUpperArm: { x: 0, y: 0, z: -30 },
      head: { x: 5, y: 5, z: 0 },
      chest: { x: -3, y: 0, z: 0 },
    }
  },
  [EmoteType.VICTORY]: {
    bones: {
      leftUpperArm: { x: -150, y: 0, z: 30 },
      rightUpperArm: { x: -150, y: 0, z: -30 },
      head: { x: -15, y: 0, z: 0 },
      chest: { x: -10, y: 0, z: 0 },
    }
  },
  [EmoteType.TRIUMPHANT]: {
    bones: {
      leftUpperArm: { x: -140, y: 10, z: 35 },
      rightUpperArm: { x: -140, y: -10, z: -35 },
      head: { x: -20, y: 0, z: 0 },
      chest: { x: -12, y: 0, z: 0 },
    }
  },

  // === AGREEMENT ===
  [EmoteType.AGREE]: {
    bones: {
      leftUpperArm: { x: 0, y: 0, z: 28 },
      rightUpperArm: { x: 0, y: 0, z: -28 },
      head: { x: 15, y: 0, z: 0 },
    }
  },
  [EmoteType.NODDING]: {
    bones: {
      leftUpperArm: { x: 0, y: 0, z: 30 },
      rightUpperArm: { x: 0, y: 0, z: -30 },
      head: { x: 18, y: 0, z: 0 },
    }
  },
  [EmoteType.APPROVING]: {
    bones: {
      leftUpperArm: { x: 0, y: 0, z: 28 },
      rightUpperArm: { x: 0, y: 0, z: -28 },
      head: { x: 10, y: 5, z: 0 },
    }
  },
  [EmoteType.SUPPORTIVE]: {
    bones: {
      leftUpperArm: { x: -20, y: 0, z: 25 },
      rightUpperArm: { x: -20, y: 0, z: -25 },
      leftLowerArm: { x: -40, y: 0, z: 0 },
      rightLowerArm: { x: -40, y: 0, z: 0 },
      head: { x: 8, y: 0, z: 0 },
    }
  },
  [EmoteType.ENCOURAGING]: {
    bones: {
      leftUpperArm: { x: -30, y: 0, z: 22 },
      rightUpperArm: { x: -30, y: 0, z: -22 },
      leftLowerArm: { x: -50, y: 0, z: 0 },
      rightLowerArm: { x: -50, y: 0, z: 0 },
      head: { x: -5, y: 0, z: 0 },
    }
  },

  // === THINKING/NEUTRAL ===
  [EmoteType.THINKING]: {
    bones: {
      leftUpperArm: { x: 0, y: 0, z: 30 },
      rightUpperArm: { x: -60, y: -30, z: -20 },
      rightLowerArm: { x: -115, y: 0, z: 0 },
      head: { x: 8, y: -10, z: 0 },
    }
  },
  [EmoteType.PONDERING]: {
    bones: {
      leftUpperArm: { x: 0, y: 0, z: 30 },
      rightUpperArm: { x: -55, y: -25, z: -25 },
      rightLowerArm: { x: -110, y: 0, z: 0 },
      head: { x: 12, y: -10, z: 0 },
    }
  },
  [EmoteType.CURIOUS]: {
    bones: {
      leftUpperArm: { x: 0, y: 0, z: 30 },
      rightUpperArm: { x: 0, y: 0, z: -30 },
      head: { x: 3, y: 18, z: 0 },
    }
  },
  [EmoteType.WONDERING]: {
    bones: {
      leftUpperArm: { x: 0, y: 0, z: 30 },
      rightUpperArm: { x: 0, y: 0, z: -30 },
      head: { x: -8, y: 12, z: 10 },
    }
  },
  [EmoteType.LISTENING]: {
    bones: {
      leftUpperArm: { x: 0, y: 0, z: 30 },
      rightUpperArm: { x: 0, y: 0, z: -30 },
      head: { x: 0, y: 5, z: 0 },
      chest: { x: 5, y: 0, z: 0 },
    }
  },
  [EmoteType.ATTENTIVE]: {
    bones: {
      leftUpperArm: { x: 0, y: 0, z: 28 },
      rightUpperArm: { x: 0, y: 0, z: -28 },
      head: { x: -3, y: 0, z: 0 },
      chest: { x: -3, y: 0, z: 0 },
    }
  },
  [EmoteType.EXPLAINING]: {
    bones: {
      leftUpperArm: { x: -30, y: 0, z: 22 },
      rightUpperArm: { x: -30, y: 0, z: -22 },
      leftLowerArm: { x: -45, y: 0, z: 0 },
      rightLowerArm: { x: -45, y: 0, z: 0 },
      head: { x: 0, y: 0, z: 0 },
    }
  },
  [EmoteType.TEACHING]: {
    bones: {
      leftUpperArm: { x: -35, y: 0, z: 20 },
      rightUpperArm: { x: -35, y: 0, z: -20 },
      leftLowerArm: { x: -50, y: 0, z: 0 },
      rightLowerArm: { x: -50, y: 0, z: 0 },
      head: { x: -5, y: 0, z: 0 },
    }
  },
  [EmoteType.CONTEMPLATING]: {
    bones: {
      leftUpperArm: { x: 0, y: 0, z: 30 },
      rightUpperArm: { x: 0, y: 0, z: -30 },
      head: { x: 15, y: -5, z: 0 },
    }
  },
  [EmoteType.REFLECTING]: {
    bones: {
      leftUpperArm: { x: 0, y: 0, z: 32 },
      rightUpperArm: { x: 0, y: 0, z: -32 },
      head: { x: 18, y: -5, z: 0 },
      chest: { x: 5, y: 0, z: 0 },
    }
  },
  [EmoteType.OBSERVING]: {
    bones: {
      leftUpperArm: { x: 0, y: 0, z: 30 },
      rightUpperArm: { x: 0, y: 0, z: -30 },
      head: { x: 0, y: 8, z: 0 },
    }
  },
  [EmoteType.ANALYZING]: {
    bones: {
      leftUpperArm: { x: 0, y: 0, z: 30 },
      rightUpperArm: { x: -45, y: -15, z: -25 },
      rightLowerArm: { x: -100, y: 0, z: 0 },
      head: { x: 5, y: -5, z: 0 },
    }
  },
  [EmoteType.SERIOUS]: {
    bones: {
      leftUpperArm: { x: 0, y: 0, z: 30 },
      rightUpperArm: { x: 0, y: 0, z: -30 },
      head: { x: 3, y: 0, z: 0 },
    }
  },
  [EmoteType.FOCUSED]: {
    bones: {
      leftUpperArm: { x: 0, y: 0, z: 28 },
      rightUpperArm: { x: 0, y: 0, z: -28 },
      head: { x: -5, y: 0, z: 0 },
      chest: { x: -3, y: 0, z: 0 },
    }
  },
  [EmoteType.MYSTERIOUS]: {
    bones: {
      leftUpperArm: { x: 0, y: 0, z: 30 },
      rightUpperArm: { x: 0, y: 0, z: -30 },
      head: { x: 5, y: 12, z: 0 },
    }
  },
  [EmoteType.ENIGMATIC]: {
    bones: {
      leftUpperArm: { x: 0, y: 0, z: 32 },
      rightUpperArm: { x: 0, y: 0, z: -32 },
      head: { x: 3, y: 15, z: 3 },
    }
  },
  [EmoteType.NEUTRAL]: {
    bones: {
      leftUpperArm: { x: 0, y: 0, z: 30 },
      rightUpperArm: { x: 0, y: 0, z: -30 },
      head: { x: 0, y: 0, z: 0 },
    }
  },
  [EmoteType.CALM]: {
    bones: {
      leftUpperArm: { x: 0, y: 0, z: 32 },
      rightUpperArm: { x: 0, y: 0, z: -32 },
      head: { x: 5, y: 0, z: 0 },
      chest: { x: 3, y: 0, z: 0 },
    }
  },

  // === NEGATIVE EMOTIONS ===
  [EmoteType.ANGRY]: {
    bones: {
      leftUpperArm: { x: 0, y: 15, z: 25 },
      rightUpperArm: { x: 0, y: -15, z: -25 },
      head: { x: 8, y: 0, z: 0 },
      chest: { x: -5, y: 0, z: 0 },
    }
  },
  [EmoteType.FURIOUS]: {
    bones: {
      leftUpperArm: { x: -20, y: 20, z: 20 },
      rightUpperArm: { x: -20, y: -20, z: -20 },
      leftLowerArm: { x: -40, y: 0, z: 0 },
      rightLowerArm: { x: -40, y: 0, z: 0 },
      head: { x: 5, y: 0, z: 0 },
      chest: { x: -8, y: 0, z: 0 },
    }
  },
  [EmoteType.IRRITATED]: {
    bones: {
      leftUpperArm: { x: 0, y: 10, z: 28 },
      rightUpperArm: { x: 0, y: -10, z: -28 },
      head: { x: 0, y: 12, z: 0 },
    }
  },
  [EmoteType.ANNOYED]: {
    bones: {
      leftUpperArm: { x: 0, y: 0, z: 32 },
      rightUpperArm: { x: 0, y: 0, z: -32 },
      head: { x: 0, y: 20, z: 0 },
    }
  },
  [EmoteType.FRUSTRATED]: {
    bones: {
      leftUpperArm: { x: -15, y: 15, z: 22 },
      rightUpperArm: { x: -15, y: -15, z: -22 },
      head: { x: 10, y: 0, z: 0 },
    }
  },
  [EmoteType.DISAGREE]: {
    bones: {
      leftUpperArm: { x: 0, y: 0, z: 25 },
      rightUpperArm: { x: 0, y: 0, z: -25 },
      head: { x: 0, y: 18, z: 0 },
    }
  },
  [EmoteType.DISAPPROVING]: {
    bones: {
      leftUpperArm: { x: 0, y: 0, z: 28 },
      rightUpperArm: { x: 0, y: 0, z: -28 },
      head: { x: -5, y: 15, z: 0 },
    }
  },

  // === SURPRISE ===
  [EmoteType.SHOCKED]: {
    bones: {
      leftUpperArm: { x: -30, y: 20, z: 40 },
      rightUpperArm: { x: -30, y: -20, z: -40 },
      head: { x: -12, y: 0, z: 0 },
    }
  },
  [EmoteType.SURPRISED]: {
    bones: {
      leftUpperArm: { x: -25, y: 15, z: 38 },
      rightUpperArm: { x: -25, y: -15, z: -38 },
      head: { x: -10, y: 0, z: 0 },
    }
  },
  [EmoteType.STARTLED]: {
    bones: {
      leftUpperArm: { x: -35, y: 25, z: 45 },
      rightUpperArm: { x: -35, y: -25, z: -45 },
      head: { x: -15, y: 0, z: 0 },
      chest: { x: -5, y: 0, z: 0 },
    }
  },
  [EmoteType.AMAZED]: {
    bones: {
      leftUpperArm: { x: -40, y: 20, z: 50 },
      rightUpperArm: { x: -40, y: -20, z: -50 },
      head: { x: -18, y: 0, z: 0 },
    }
  },
  [EmoteType.AWE]: {
    bones: {
      leftUpperArm: { x: -35, y: 15, z: 45 },
      rightUpperArm: { x: -35, y: -15, z: -45 },
      head: { x: -20, y: 5, z: 0 },
      chest: { x: -8, y: 0, z: 0 },
    }
  },

  // === SAD ===
  [EmoteType.SAD]: {
    bones: {
      leftUpperArm: { x: 0, y: 0, z: 38 },
      rightUpperArm: { x: 0, y: 0, z: -38 },
      head: { x: 22, y: 0, z: 0 },
      chest: { x: 15, y: 0, z: 0 },
    }
  },
  [EmoteType.MELANCHOLIC]: {
    bones: {
      leftUpperArm: { x: 0, y: 0, z: 40 },
      rightUpperArm: { x: 0, y: 0, z: -40 },
      head: { x: 25, y: -5, z: 0 },
      chest: { x: 18, y: 0, z: 0 },
    }
  },
  [EmoteType.DISAPPOINTED]: {
    bones: {
      leftUpperArm: { x: 0, y: 0, z: 35 },
      rightUpperArm: { x: 0, y: 0, z: -35 },
      head: { x: 18, y: 12, z: 3 },
    }
  },
  [EmoteType.DEJECTED]: {
    bones: {
      leftUpperArm: { x: 0, y: 0, z: 42 },
      rightUpperArm: { x: 0, y: 0, z: -42 },
      head: { x: 28, y: 0, z: 0 },
      chest: { x: 20, y: 0, z: 0 },
    }
  },
  [EmoteType.NOSTALGIC]: {
    bones: {
      leftUpperArm: { x: 0, y: 0, z: 35 },
      rightUpperArm: { x: 0, y: 0, z: -35 },
      head: { x: 15, y: 10, z: 0 },
    }
  },
  [EmoteType.WISTFUL]: {
    bones: {
      leftUpperArm: { x: 0, y: 0, z: 33 },
      rightUpperArm: { x: 0, y: 0, z: -33 },
      head: { x: 12, y: 15, z: 5 },
    }
  },

  // === DOUBT ===
  [EmoteType.SKEPTICAL]: {
    bones: {
      leftUpperArm: { x: 0, y: 0, z: 30 },
      rightUpperArm: { x: 0, y: 0, z: -30 },
      head: { x: 0, y: 15, z: 0 },
    }
  },
  [EmoteType.DOUBTFUL]: {
    bones: {
      leftUpperArm: { x: 0, y: 0, z: 30 },
      rightUpperArm: { x: 0, y: 0, z: -30 },
      head: { x: 5, y: 10, z: 10 },
    }
  },
  [EmoteType.SUSPICIOUS]: {
    bones: {
      leftUpperArm: { x: 0, y: 0, z: 28 },
      rightUpperArm: { x: 0, y: 0, z: -28 },
      head: { x: 3, y: 12, z: 0 },
    }
  },
  [EmoteType.CONFUSED]: {
    bones: {
      leftUpperArm: { x: 0, y: 0, z: 30 },
      rightUpperArm: { x: 0, y: 0, z: -30 },
      head: { x: 5, y: 22, z: 0 },
    }
  },
  [EmoteType.PUZZLED]: {
    bones: {
      leftUpperArm: { x: 0, y: 0, z: 30 },
      rightUpperArm: { x: -40, y: -15, z: -25 },
      rightLowerArm: { x: -90, y: 0, z: 0 },
      head: { x: 3, y: 18, z: 0 },
    }
  },
  [EmoteType.BEWILDERED]: {
    bones: {
      leftUpperArm: { x: -15, y: 10, z: 38 },
      rightUpperArm: { x: -15, y: -10, z: -38 },
      head: { x: -5, y: 25, z: 0 },
    }
  },

  // === FEAR ===
  [EmoteType.FEARFUL]: {
    bones: {
      leftUpperArm: { x: -25, y: 25, z: 30 },
      rightUpperArm: { x: -25, y: -25, z: -30 },
      head: { x: -8, y: 0, z: 0 },
      chest: { x: 8, y: 0, z: 0 },
    }
  },
  [EmoteType.ANXIOUS]: {
    bones: {
      leftUpperArm: { x: -15, y: 15, z: 28 },
      rightUpperArm: { x: -15, y: -15, z: -28 },
      head: { x: 5, y: 5, z: 0 },
    }
  },
  [EmoteType.WORRIED]: {
    bones: {
      leftUpperArm: { x: -10, y: 10, z: 30 },
      rightUpperArm: { x: -10, y: -10, z: -30 },
      head: { x: 8, y: 5, z: 0 },
    }
  },
  [EmoteType.NERVOUS]: {
    bones: {
      leftUpperArm: { x: -8, y: 8, z: 30 },
      rightUpperArm: { x: -8, y: -8, z: -30 },
      head: { x: 3, y: 8, z: 0 },
    }
  },

  // === PERSONALITY ===
  [EmoteType.ARROGANT]: {
    bones: {
      leftUpperArm: { x: 0, y: 15, z: 28 },
      rightUpperArm: { x: 0, y: -15, z: -28 },
      head: { x: -18, y: 15, z: 0 },
      chest: { x: -10, y: 0, z: 0 },
    }
  },
  [EmoteType.CONDESCENDING]: {
    bones: {
      leftUpperArm: { x: 0, y: 10, z: 28 },
      rightUpperArm: { x: 0, y: -10, z: -28 },
      head: { x: -15, y: 12, z: 0 },
    }
  },
  [EmoteType.SHY]: {
    bones: {
      leftUpperArm: { x: 0, y: 15, z: 35 },
      rightUpperArm: { x: 0, y: -15, z: -35 },
      head: { x: 15, y: -10, z: 8 },
      chest: { x: 8, y: 0, z: 0 },
    }
  },
  [EmoteType.BASHFUL]: {
    bones: {
      leftUpperArm: { x: 0, y: 20, z: 35 },
      rightUpperArm: { x: 0, y: -20, z: -35 },
      head: { x: 18, y: -12, z: 10 },
    }
  },
  [EmoteType.CONFIDENT]: {
    bones: {
      leftUpperArm: { x: 0, y: 15, z: 22 },
      rightUpperArm: { x: 0, y: -15, z: -22 },
      head: { x: -8, y: 0, z: 0 },
      chest: { x: -8, y: 0, z: 0 },
    }
  },
  [EmoteType.ASSERTIVE]: {
    bones: {
      leftUpperArm: { x: 0, y: 10, z: 24 },
      rightUpperArm: { x: 0, y: -10, z: -24 },
      head: { x: -5, y: 0, z: 0 },
      chest: { x: -5, y: 0, z: 0 },
    }
  },
  [EmoteType.HUMBLE]: {
    bones: {
      leftUpperArm: { x: 0, y: 0, z: 35 },
      rightUpperArm: { x: 0, y: 0, z: -35 },
      head: { x: 12, y: 0, z: 0 },
    }
  },
  [EmoteType.MODEST]: {
    bones: {
      leftUpperArm: { x: 0, y: 0, z: 33 },
      rightUpperArm: { x: 0, y: 0, z: -33 },
      head: { x: 10, y: -5, z: 0 },
    }
  },

  // === SPECIAL ===
  [EmoteType.DRAMATIC]: {
    bones: {
      leftUpperArm: { x: -60, y: 30, z: 50 },
      rightUpperArm: { x: -20, y: 0, z: -28 },
      head: { x: -15, y: 20, z: 0 },
      chest: { x: -10, y: 5, z: 0 },
    }
  },
  [EmoteType.THEATRICAL]: {
    bones: {
      leftUpperArm: { x: -70, y: 25, z: 45 },
      rightUpperArm: { x: -45, y: -25, z: -40 },
      head: { x: -20, y: 15, z: 0 },
      chest: { x: -8, y: 0, z: 5 },
    }
  },
  [EmoteType.PASSIONATE]: {
    bones: {
      leftUpperArm: { x: -25, y: 20, z: 25 },
      rightUpperArm: { x: -25, y: -20, z: -25 },
      leftLowerArm: { x: -60, y: 0, z: 0 },
      rightLowerArm: { x: -60, y: 0, z: 0 },
      head: { x: -5, y: 0, z: 0 },
      chest: { x: -5, y: 0, z: 0 },
    }
  },
  [EmoteType.INTENSE]: {
    bones: {
      leftUpperArm: { x: -20, y: 15, z: 22 },
      rightUpperArm: { x: -20, y: -15, z: -22 },
      head: { x: -8, y: 0, z: 0 },
      chest: { x: -8, y: 0, z: 0 },
    }
  },
  [EmoteType.BORED]: {
    bones: {
      leftUpperArm: { x: 0, y: 0, z: 40 },
      rightUpperArm: { x: 0, y: 0, z: -40 },
      head: { x: 15, y: 10, z: 0 },
      chest: { x: 8, y: 0, z: 0 },
    }
  },
  [EmoteType.TIRED]: {
    bones: {
      leftUpperArm: { x: 0, y: 0, z: 42 },
      rightUpperArm: { x: 0, y: 0, z: -42 },
      head: { x: 20, y: 0, z: 0 },
      chest: { x: 12, y: 0, z: 0 },
    }
  },
  [EmoteType.SLEEPY]: {
    bones: {
      leftUpperArm: { x: 0, y: 0, z: 45 },
      rightUpperArm: { x: 0, y: 0, z: -45 },
      head: { x: 25, y: -5, z: 0 },
      chest: { x: 15, y: 0, z: 0 },
    }
  },
  [EmoteType.DISGUSTED]: {
    bones: {
      leftUpperArm: { x: 0, y: 10, z: 30 },
      rightUpperArm: { x: 0, y: -10, z: -30 },
      head: { x: -5, y: 15, z: -5 },
    }
  },
  [EmoteType.REPULSED]: {
    bones: {
      leftUpperArm: { x: 0, y: 20, z: 35 },
      rightUpperArm: { x: 0, y: -20, z: -35 },
      head: { x: -8, y: 18, z: -8 },
      chest: { x: 5, y: 0, z: 0 },
    }
  },
  [EmoteType.INSPIRED]: {
    bones: {
      leftUpperArm: { x: -30, y: 10, z: 38 },
      rightUpperArm: { x: -30, y: -10, z: -38 },
      head: { x: -15, y: 5, z: 0 },
      chest: { x: -8, y: 0, z: 0 },
    }
  },
};

// VRM Avatar Model Component
const VRMAvatarModel = ({
  url,
  emote,
  setBoundingBox,
  onLoaded
}: {
  url: string,
  emote: EmoteType,
  setBoundingBox: (box: THREE.Box3) => void,
  onLoaded?: () => void
}) => {
  const [vrm, setVrm] = useState<VRM | null>(null);
  const [gltf, setGltf] = useState<any>(null);
  const loadedRef = useRef(false);
  const idleTimerRef = useRef<number>(0);
  const currentIdleRef = useRef<EmoteType>(EmoteType.IDLE);

  // Load VRM
  useEffect(() => {
    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));

    loader.load(
      url,
      (loadedGltf) => {
        const loadedVrm = loadedGltf.userData.vrm as VRM | undefined;

        if (loadedVrm) {
          // It's a VRM file
          loadedVrm.scene.rotation.y = Math.PI; // Face camera
          setVrm(loadedVrm);
          setGltf(loadedGltf);

          // Calculate bounding box
          const box = new THREE.Box3().setFromObject(loadedVrm.scene);
          setBoundingBox(box);

          // Apply initial pose immediately
          applyPoseToVRM(loadedVrm, EMOTE_LIBRARY[EmoteType.IDLE]);
        } else {
          // It's a regular GLB file
          loadedGltf.scene.rotation.y = Math.PI;
          setGltf(loadedGltf);

          const box = new THREE.Box3().setFromObject(loadedGltf.scene);
          setBoundingBox(box);
        }

        if (!loadedRef.current) {
          loadedRef.current = true;
          onLoaded?.();
        }
      },
      undefined,
      (error) => {
        console.error('Error loading model:', error);
      }
    );

    return () => {
      if (vrm) {
        // Cleanup
      }
    };
  }, [url]);

  // Apply pose to VRM
  const applyPoseToVRM = (vrmInstance: VRM, pose: PoseDefinition) => {
    if (!vrmInstance.humanoid) return;

    Object.entries(pose.bones).forEach(([boneKey, rotation]) => {
      const vrmBoneName = BONE_MAP[boneKey];
      if (!vrmBoneName) return;

      const bone = vrmInstance.humanoid?.getNormalizedBoneNode(vrmBoneName);
      if (bone) {
        bone.rotation.x = d2r(rotation.x);
        bone.rotation.y = d2r(rotation.y);
        bone.rotation.z = d2r(rotation.z);
      }
    });
  };

  // Animation frame
  useFrame((state, delta) => {
    if (!vrm?.humanoid) return;

    const time = state.clock.getElapsedTime();

    // Update VRM
    vrm.update(delta);

    // Cycle through idle animations
    if (emote === EmoteType.IDLE || IDLE_EMOTES.includes(emote)) {
      idleTimerRef.current += delta;
      if (idleTimerRef.current > 10) {
        idleTimerRef.current = 0;
        const randomIdle = IDLE_EMOTES[Math.floor(Math.random() * IDLE_EMOTES.length)];
        currentIdleRef.current = randomIdle;
      }
    } else {
      idleTimerRef.current = 0;
    }

    const activeEmote = (emote === EmoteType.IDLE || IDLE_EMOTES.includes(emote))
      ? currentIdleRef.current
      : emote;

    const targetPose = EMOTE_LIBRARY[activeEmote] || EMOTE_LIBRARY[EmoteType.IDLE];
    const speed = 4.5 * delta;

    // Apply pose with smooth interpolation
    Object.entries(targetPose.bones).forEach(([boneKey, rotation]) => {
      const vrmBoneName = BONE_MAP[boneKey];
      if (!vrmBoneName) return;

      const bone = vrm.humanoid?.getNormalizedBoneNode(vrmBoneName);
      if (!bone) return;

      // Breathing animation
      const breathSpeed = 2.0;
      const breathY = Math.sin(time * breathSpeed) * 1.5;
      const breathZ = Math.cos(time * breathSpeed) * 0.8;
      const breathX = Math.sin(time * breathSpeed * 0.5) * 0.5;
      const isArm = boneKey.includes('Arm');

      // Talk head movement
      let talkX = 0;
      let talkY = 0;
      if (emote === EmoteType.TALKING || emote === EmoteType.TALKING_EXCITED || emote === EmoteType.TALKING_CALM) {
        if (boneKey === 'head') {
          const talkSpeed = emote === EmoteType.TALKING_EXCITED ? 20 : emote === EmoteType.TALKING_CALM ? 14 : 16;
          talkX = Math.sin(time * talkSpeed) * 4;
          talkY = Math.cos(time * talkSpeed * 0.7) * 2;
        }
      }

      // Subtle idle movement for chest
      let idleChest = 0;
      if (boneKey === 'chest') {
        idleChest = Math.sin(time * 1.2) * 1;
      }

      const finalX = d2r(rotation.x + talkX + (boneKey === 'chest' ? breathX : 0) + idleChest);
      const finalY = d2r(rotation.y + talkY + (isArm ? breathY : 0));
      const finalZ = d2r(rotation.z + (isArm ? breathZ : 0));

      bone.rotation.x = THREE.MathUtils.lerp(bone.rotation.x, finalX, speed);
      bone.rotation.y = THREE.MathUtils.lerp(bone.rotation.y, finalY, speed);
      bone.rotation.z = THREE.MathUtils.lerp(bone.rotation.z, finalZ, speed);
    });
  });

  if (!gltf) return null;

  return <Primitive object={vrm?.scene || gltf.scene} />;
};

// Auto Camera - Scale to fit with 80% coverage
const AutoCamera = ({ bounds }: { bounds: THREE.Box3 | null }) => {
  const { camera, controls } = useThree();
  const initialized = useRef(false);

  useEffect(() => {
    if (bounds && !initialized.current) {
      const boxSize = new THREE.Vector3();
      bounds.getSize(boxSize);

      const modelHeight = boxSize.y;
      const headHeight = bounds.min.y + modelHeight * 0.85;

      // Calculate camera distance for proper framing
      const visibleHeight = modelHeight * 0.5;
      const fov = (camera as THREE.PerspectiveCamera).fov;
      const fovRad = (fov * Math.PI) / 180;
      const coverageRatio = 0.8;
      const distance = (visibleHeight / 2) / Math.tan(fovRad / 2) / coverageRatio;

      const cameraDistance = Math.max(distance, 0.8);
      camera.position.set(0, headHeight, cameraDistance);

      if (controls) {
        (controls as any).target.set(0, headHeight - modelHeight * 0.1, 0);
        (controls as any).update();
      }

      camera.lookAt(0, headHeight - modelHeight * 0.1, 0);
      initialized.current = true;
    }
  }, [bounds, camera, controls]);

  return null;
};

// Loading Overlay Component
const LoadingOverlay: React.FC<{ progress: number }> = ({ progress }) => (
  <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-800 to-black flex flex-col items-center justify-center z-10">
    <div className="relative w-24 h-24 mb-6">
      <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
      <div
        className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"
        style={{ animationDuration: '1s' }}
      ></div>
      <div className="absolute inset-2 border-4 border-transparent border-t-purple-500 rounded-full animate-spin"
        style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}
      ></div>
    </div>
    <div className="text-center">
      <p className="text-white text-lg font-medium mb-2">Loading Avatar</p>
      <p className="text-gray-400 text-sm">{Math.round(progress)}%</p>
    </div>
    <div className="w-48 h-1 bg-gray-700 rounded-full mt-4 overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  </div>
);

interface Avatar3DProps {
  vrmUrl: string;
  animationState: EmoteType;
  onModelLoaded?: () => void;
}

const Avatar3D: React.FC<Avatar3DProps> = ({ vrmUrl, animationState, onModelLoaded }) => {
  const [bounds, setBounds] = useState<THREE.Box3 | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);

  // Simulate loading progress
  useEffect(() => {
    setIsLoading(true);
    setLoadProgress(0);

    const progressInterval = setInterval(() => {
      setLoadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 100);

    return () => clearInterval(progressInterval);
  }, [vrmUrl]);

  const handleModelLoaded = useCallback(() => {
    setLoadProgress(100);
    setTimeout(() => {
      setIsLoading(false);
      onModelLoaded?.();
    }, 300);
  }, [onModelLoaded]);

  return (
    <div className="w-full h-full min-h-[400px] bg-gradient-to-b from-gray-900 to-black rounded-lg overflow-hidden relative shadow-2xl border border-gray-800">
      {isLoading && <LoadingOverlay progress={loadProgress} />}

      <Canvas camera={{ fov: 35, near: 0.1, far: 100 }}>
        <AmbientLight intensity={1.8} />
        <DirectionalLight position={[5, 5, 5]} intensity={0.8} />
        <PointLight position={[-5, 5, -5]} intensity={0.5} color="#8b5cf6" />
        <SpotLight position={[0, 8, 3]} intensity={0.6} angle={0.4} penumbra={1} color="#ffffff" />

        <React.Suspense fallback={null}>
          <VRMAvatarModel
            url={vrmUrl}
            emote={animationState}
            setBoundingBox={setBounds}
            onLoaded={handleModelLoaded}
          />
        </React.Suspense>

        <AutoCamera bounds={bounds} />
        <Environment preset="city" />
        <OrbitControls
          enablePan={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.8}
          enableZoom={true}
          minDistance={0.5}
          maxDistance={4.0}
        />
      </Canvas>

      {/* Emote indicator */}
      <div className="absolute top-4 right-4 flex gap-2">
        <div className="bg-black/60 px-3 py-1.5 rounded-full text-xs text-white backdrop-blur-md border border-white/10 shadow-lg flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            animationState === EmoteType.TALKING ||
            animationState === EmoteType.TALKING_EXCITED ||
            animationState === EmoteType.TALKING_CALM
              ? 'bg-green-500 animate-pulse'
              : 'bg-blue-400'
          }`}></div>
          {animationState.replace(/_/g, ' ')}
        </div>
      </div>
    </div>
  );
};

export default Avatar3D;
