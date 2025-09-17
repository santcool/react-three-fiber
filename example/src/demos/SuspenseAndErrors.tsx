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

  useEffect(() => {
    const scaleRate = objUrl.includes('qingtong') ? 1.5 : 2
    if (modelRef.current) {
      modelRef.current.position.y = -0.6
      modelRef.current.scale.y = scaleRate
      modelRef.current.scale.x = scaleRate
      modelRef.current.scale.z = scaleRate
      if (!objUrl.includes('qingtong')) {
        modelRef.current.rotation.z = Math.PI / 2.1
        modelRef.current.rotation.y = 3.1
        modelRef.current.rotation.x = -0.7
        modelRef.current.position.y = -0.2
        modelRef.current.position.x = -0.35
      }
    }
  }, [modelRef, objUrl])

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
      title: '白瓷阿南佛像',
      description:
        '白瓷阿南佛像是1980年哲盟博物馆在库伦旗前勿力布格村征集的佛教造像，此造像胎质细腻、釉色润亮，衣褶雕刻精细，面部表情生动，分别呈现说法印与执念珠特征，属定窑工艺代表作。2017年通辽市博物馆确认其为国家一级文物，代表辽代北方瓷器工艺巅峰。2022年该馆以馆藏辽代白瓷佛像为载体开展青少年社教活动，强化文物社会教育功能',
      texture: PUBLIC_PATH + 'anan/tex0.png',
    },
    model2: {
      obj: PUBLIC_PATH + 'qingtong/model.obj',
      mtl: PUBLIC_PATH + 'qingtong/model.mtl',
      title: '青铜簋',
      description:
        '这是青铜簋（guǐ），是中国古代用于盛放煮熟饭食的器皿，也是重要的礼器 ，在祭祀和宴飨时，和鼎配合使用，多以偶数出现。青铜簋造型多样，此件簋带有双耳，下方是带有装饰的方座，常见于商周时期，反映了当时的礼仪制度和青铜铸造工艺水平。',
      texture: PUBLIC_PATH + 'qingtong/tex0.png',
    },
  }

  return (
    <div className="container">
      <div className="header">
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
        <h1>数字藏品 - {models[model].title}</h1>
        <p>{models[model].description}</p>
      </div>
      <div className="controls">
        <button className={`btn ${model === 'model1' ? 'active' : ''}`} onClick={() => setModel('model1')}>
          {models['model1'].title}
        </button>
        <button className={`btn ${model === 'model2' ? 'active' : ''}`} onClick={() => setModel('model2')}>
          {models['model2'].title}
        </button>
      </div>
    </div>
  )
}

export default function App() {
  return <ModelViewer />
}
