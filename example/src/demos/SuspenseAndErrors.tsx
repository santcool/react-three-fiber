import * as React from 'react'
import * as THREE from 'three'
import { useState, useEffect } from 'react'
import { Canvas, useLoader, useFrame } from '@react-three/fiber'
import { suspend } from 'suspend-react'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js'
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js'
import { DDSLoader } from 'three-stdlib'
import { Suspense, useDeferredValue } from 'react'
import { Environment, OrbitControls, useProgress, Html, useTexture } from '@react-three/drei'
import './suspense.css'

const { NODE_ENV } = process.env
// 是否本地开发环境
const LOCAL_DEV = NODE_ENV && NODE_ENV !== 'production'
console.log('NODE_ENV', NODE_ENV, LOCAL_DEV, process.env)

const PUBLIC_PATH = LOCAL_DEV ? '/' : '/speedcat-nft/'
// 带纹理的模型组件
function TexturedModel({ objUrl, mtlUrl, textureUrl }) {
  // 先加载材质
  const materials = useLoader(MTLLoader, mtlUrl)

  // 然后加载OBJ，并将材质应用上去
  const obj = useLoader(OBJLoader, objUrl, (loader) => {
    if (materials) {
      materials.preload()
      loader.setMaterials(materials)
    }
  })

  // 加载纹理
  const texture = useLoader(THREE.TextureLoader, textureUrl)

  // 创建模型的引用以便进行旋转动画
  const modelRef = React.useRef()

  // 每一帧旋转模型
  useFrame(() => {
    if (modelRef.current) {
      // modelRef.current.rotation.z += 0.005
      // modelRef.current.rotation.y += 0.005
      // modelRef.current.rotation.x += 0.005
    }
  })

  // 克隆对象并应用纹理
  const clone = React.useMemo(() => {
    if (!obj) return null
    const objectClone = obj.clone()

    // 遍历对象并应用纹理
    objectClone.traverse((child, index) => {
      if (child.isMesh) {
        console.log('child', child)
        // 保存原始材质
        const originalMaterial = child.material

        // 创建新材质并应用纹理
        child.material = Array.isArray(texture)
          ? texture.map(
              (item) =>
                new THREE.MeshPhongMaterial({
                  map: item,
                  shininess: originalMaterial.shininess || 30,
                  specular: originalMaterial.specular || new THREE.Color(0x222222),
                }),
            )
          : new THREE.MeshPhongMaterial({
              map: texture,
              shininess: originalMaterial.shininess || 30,
              specular: originalMaterial.specular || new THREE.Color(0x222222),
            })
      }
    })

    return objectClone
  }, [obj, texture])

  return clone ? <primitive ref={modelRef} object={clone} /> : null
}

// 场景灯光
function Lights() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
    </>
  )
}

// 加载指示器
function Loader() {
  const { progress } = useProgress()
  return (
    <Html center>
      <div className="loading">{progress.toFixed(2)}% 加载中</div>
    </Html>
  )
}

// 主组件
function ModelViewer() {
  const [model, setModel] = React.useState('model2')

  // 模型配置
  const models = {
    model1: {
      obj: PUBLIC_PATH + 'anan/model.obj',
      mtl: PUBLIC_PATH + 'anan/model.mtl',
      title: '阿南佛像',
      description: '这是一个阿南佛像',
      texture: PUBLIC_PATH + 'anan/tex0.png',
    },
    model2: {
      obj: PUBLIC_PATH + 'qingtong/model.obj',
      mtl: PUBLIC_PATH + 'qingtong/model.mtl',
      title: '青铜器',
      description: '这是一个青铜器',
      texture: PUBLIC_PATH + 'qingtong/tex0.png',
    },
    model3: {
      obj: PUBLIC_PATH + 'shanxi/Model.obj',
      mtl: PUBLIC_PATH + 'shanxi/Model.mtl',
      title: '山西',
      description: '山西博物馆',
      texture: [
        PUBLIC_PATH + 'shanxi/Model_0.jpg',
        PUBLIC_PATH + 'shanxi/Model_1.jpg',
        PUBLIC_PATH + 'shanxi/Model_2.jpg',
        PUBLIC_PATH + 'shanxi/Model_3.jpg',
      ],
    },
  }

  return (
    <div className="container">
      <div className="header">
        <h1>数字藏品</h1>
        <p>{models[model].description}</p>
      </div>

      <div className="viewer-container">
        <Canvas camera={{ position: [0, 0, 3], fov: 50 }} shadows>
          <React.Suspense fallback={<Loader />}>
            <TexturedModel objUrl={models[model].obj} mtlUrl={models[model].mtl} textureUrl={models[model].texture} />
            <Lights />
            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minPolarAngle={0}
              maxPolarAngle={Math.PI / 2}
            />
          </React.Suspense>
        </Canvas>

        {/* <div className="info-panel">
          <h3>{models[model].title}</h3>
          <p>{models[model].description}</p>
          <p>当前纹理: {textures[texture].name}</p>
          <p>使用鼠标拖动来旋转、平移和缩放模型。</p>
        </div> */}
      </div>

      <div className="controls">
        <button className={`btn ${model === 'model1' ? 'active' : ''}`} onClick={() => setModel('model1')}>
          {models['model1'].title}
        </button>
        <button className={`btn ${model === 'model2' ? 'active' : ''}`} onClick={() => setModel('model2')}>
          {models['model2'].title}
        </button>
        <button className={`btn ${model === 'model3' ? 'active' : ''}`} onClick={() => setModel('model3')}>
          {models['model3'].title}
        </button>
      </div>
    </div>
  )
}

export default function App() {
  return <ModelViewer />
}
