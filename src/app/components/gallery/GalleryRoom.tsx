import { useRef } from 'react'
import * as THREE from 'three'

// Room dimensions (20x larger)
const roomWidth = 400
const roomLength = 600
const roomHeight = 160 // 5x taller ceiling

export const GalleryRoom = () => {
  const roomRef = useRef<THREE.Group>(null)

  // Colors that change based on night mode
  const colors = {
    floor: '#d5d0c5', // Default marble
    walls: '#f0f0f0', // Default walls
    ceiling: '#ffffff', // Default ceiling
    pedestal: '#c4b59d', // Default wood
    glass: '#cceeff', // Default glass
    pillar: '#e0e0e0', // Default pillar
    trim: '#d4af37', // Default gold/brass
    accent: '#6a93cb', // Default accent
  }

  return (
    <group ref={roomRef}>
      {/* Floor with reflective grid */}
      <group rotation={[-Math.PI / 2, 0, 0]}>
        {/* Main floor */}
        <mesh receiveShadow>
          <planeGeometry args={[roomWidth, roomLength]} />
          <meshPhysicalMaterial
            color={colors.floor}
            metalness={0.4}
            roughness={0.08}
            clearcoat={0.6}
            clearcoatRoughness={0.1}
            reflectivity={0.8}
            envMapIntensity={0.2}
          />
        </mesh>
        
        {/* Grid overlay */}
        <mesh position={[0, 0, 0.01]}>
          <planeGeometry args={[roomWidth, roomLength]} />
          <meshStandardMaterial
            color="#1e3799"
            transparent={true}
            opacity={0.05}
            wireframe={true}
          />
        </mesh>
        
        {/* Grid lines */}
        {Array.from({ length: Math.floor(roomWidth / 40) + 1 }).map((_, i) => (
          <mesh key={`grid-x-${i}`} position={[i * 40 - roomWidth / 2, 0, 0.02]} rotation={[0, 0, 0]}>
            <planeGeometry args={[1, roomLength]} />
            <meshStandardMaterial
              color="#4a69bd"
              transparent={true}
              opacity={0.1}
            />
          </mesh>
        ))}
        
        {Array.from({ length: Math.floor(roomLength / 40) + 1 }).map((_, i) => (
          <mesh key={`grid-z-${i}`} position={[0, i * 40 - roomLength / 2, 0.02]} rotation={[0, 0, Math.PI / 2]}>
            <planeGeometry args={[1, roomWidth]} />
            <meshStandardMaterial
              color="#4a69bd"
              transparent={true}
              opacity={0.1}
            />
          </mesh>
        ))}
      </group>

      {/* Walls */}
      <group>
        {/* Front wall */}
        <mesh position={[0, roomHeight / 2, -roomLength / 2]} castShadow receiveShadow>
          <boxGeometry args={[roomWidth, roomHeight, 4]} />
          <meshStandardMaterial
            color={colors.walls}
            metalness={0.05}
            roughness={0.9}
          />
        </mesh>
        
        {/* Front wall decorative elements */}
        <group position={[0, roomHeight / 2, -roomLength / 2 + 2.5]}>
          {/* Horizontal trim near ceiling */}
          <mesh position={[0, roomHeight / 2 - 15, 0]} castShadow receiveShadow>
            <boxGeometry args={[roomWidth - 10, 5, 1]} />
            <meshStandardMaterial
              color={colors.trim}
              metalness={0.6}
              roughness={0.3}
              emissive="#000000"
              emissiveIntensity={0.2}
            />
          </mesh>
          
          {/* Horizontal trim near floor */}
          <mesh position={[0, -roomHeight / 2 + 15, 0]} castShadow receiveShadow>
            <boxGeometry args={[roomWidth - 10, 5, 1]} />
            <meshStandardMaterial
              color={colors.trim}
              metalness={0.6}
              roughness={0.3}
              emissive="#000000"
              emissiveIntensity={0.2}
            />
          </mesh>
          
          {/* Decorative panels */}
          {Array.from({ length: 5 }).map((_, i) => (
            <mesh 
              key={`front-panel-${i}`}
              position={[(i - 2) * 80, 0, 0]} 
              castShadow 
              receiveShadow
            >
              <boxGeometry args={[60, 70, 1]} />
              <meshStandardMaterial
                color={colors.accent}
                metalness={0.2}
                roughness={0.7}
                emissive="#000000"
                emissiveIntensity={0.1}
              />
            </mesh>
          ))}
        </group>

        {/* Back wall */}
        <mesh position={[0, roomHeight / 2, roomLength / 2]} castShadow receiveShadow>
          <boxGeometry args={[roomWidth, roomHeight, 4]} />
          <meshStandardMaterial
            color={colors.walls}
            metalness={0.05}
            roughness={0.9}
          />
        </mesh>
        
        {/* Back wall decorative elements */}
        <group position={[0, roomHeight / 2, roomLength / 2 - 2.5]}>
          {/* Horizontal trim near ceiling */}
          <mesh position={[0, roomHeight / 2 - 15, 0]} castShadow receiveShadow>
            <boxGeometry args={[roomWidth - 10, 5, 1]} />
            <meshStandardMaterial
              color={colors.trim}
              metalness={0.6}
              roughness={0.3}
              emissive="#000000"
              emissiveIntensity={0.2}
            />
          </mesh>
          
          {/* Horizontal trim near floor */}
          <mesh position={[0, -roomHeight / 2 + 15, 0]} castShadow receiveShadow>
            <boxGeometry args={[roomWidth - 10, 5, 1]} />
            <meshStandardMaterial
              color={colors.trim}
              metalness={0.6}
              roughness={0.3}
              emissive="#000000"
              emissiveIntensity={0.2}
            />
          </mesh>
          
          {/* Decorative panels */}
          {Array.from({ length: 5 }).map((_, i) => (
            <mesh 
              key={`back-panel-${i}`}
              position={[(i - 2) * 80, 0, 0]} 
              castShadow 
              receiveShadow
            >
              <boxGeometry args={[60, 70, 1]} />
              <meshStandardMaterial
                color={colors.accent}
                metalness={0.2}
                roughness={0.7}
                emissive="#000000"
                emissiveIntensity={0.1}
              />
            </mesh>
          ))}
        </group>

        {/* Left wall */}
        <mesh position={[-roomWidth / 2, roomHeight / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[4, roomHeight, roomLength]} />
          <meshStandardMaterial
            color={colors.walls}
            metalness={0.05}
            roughness={0.9}
          />
        </mesh>
        
        {/* Left wall decorative elements */}
        <group position={[-roomWidth / 2 + 2.5, roomHeight / 2, 0]}>
          {/* Horizontal trim near ceiling */}
          <mesh position={[0, roomHeight / 2 - 15, 0]} castShadow receiveShadow>
            <boxGeometry args={[1, 5, roomLength - 10]} />
            <meshStandardMaterial
              color={colors.trim}
              metalness={0.6}
              roughness={0.3}
              emissive="#000000"
              emissiveIntensity={0.2}
            />
          </mesh>
          
          {/* Horizontal trim near floor */}
          <mesh position={[0, -roomHeight / 2 + 15, 0]} castShadow receiveShadow>
            <boxGeometry args={[1, 5, roomLength - 10]} />
            <meshStandardMaterial
              color={colors.trim}
              metalness={0.6}
              roughness={0.3}
              emissive="#000000"
              emissiveIntensity={0.2}
            />
          </mesh>
          
          {/* Decorative panels */}
          {Array.from({ length: 7 }).map((_, i) => (
            <mesh 
              key={`left-panel-${i}`}
              position={[0, 0, (i - 3) * 80]} 
              castShadow 
              receiveShadow
            >
              <boxGeometry args={[1, 70, 60]} />
              <meshStandardMaterial
                color={colors.accent}
                metalness={0.2}
                roughness={0.7}
                emissive="#000000"
                emissiveIntensity={0.1}
              />
            </mesh>
          ))}
        </group>

        {/* Right wall */}
        <mesh position={[roomWidth / 2, roomHeight / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[4, roomHeight, roomLength]} />
          <meshStandardMaterial
            color={colors.walls}
            metalness={0.05}
            roughness={0.9}
          />
        </mesh>
        
        {/* Right wall decorative elements */}
        <group position={[roomWidth / 2 - 2.5, roomHeight / 2, 0]}>
          {/* Horizontal trim near ceiling */}
          <mesh position={[0, roomHeight / 2 - 15, 0]} castShadow receiveShadow>
            <boxGeometry args={[1, 5, roomLength - 10]} />
            <meshStandardMaterial
              color={colors.trim}
              metalness={0.6}
              roughness={0.3}
              emissive="#000000"
              emissiveIntensity={0.2}
            />
          </mesh>
          
          {/* Horizontal trim near floor */}
          <mesh position={[0, -roomHeight / 2 + 15, 0]} castShadow receiveShadow>
            <boxGeometry args={[1, 5, roomLength - 10]} />
            <meshStandardMaterial
              color={colors.trim}
              metalness={0.6}
              roughness={0.3}
              emissive="#000000"
              emissiveIntensity={0.2}
            />
          </mesh>
          
          {/* Decorative panels */}
          {Array.from({ length: 7 }).map((_, i) => (
            <mesh 
              key={`right-panel-${i}`}
              position={[0, 0, (i - 3) * 80]} 
              castShadow 
              receiveShadow
            >
              <boxGeometry args={[1, 70, 60]} />
              <meshStandardMaterial
                color={colors.accent}
                metalness={0.2}
                roughness={0.7}
                emissive="#000000"
                emissiveIntensity={0.1}
              />
            </mesh>
          ))}
        </group>

        {/* Ceiling */}
        <mesh position={[0, roomHeight, 0]} castShadow receiveShadow>
          <boxGeometry args={[roomWidth, 4, roomLength]} />
          <meshStandardMaterial
            color={colors.ceiling}
            metalness={0.1}
            roughness={0.8}
          />
        </mesh>
        
        {/* Ceiling trim */}
        <mesh position={[0, roomHeight - 3, 0]} castShadow receiveShadow>
          <boxGeometry args={[roomWidth - 10, 2, roomLength - 10]} />
          <meshStandardMaterial
            color={colors.trim}
            metalness={0.6}
            roughness={0.3}
            emissive="#000000"
            emissiveIntensity={0.2}
          />
        </mesh>
      </group>

      {/* Modern gallery elements */}
      {Array.from({ length: 5 }).map((_, i) => {
        // Create pedestals for art displays
        const row = Math.floor(i / 3);
        const col = i % 3;
        const sectionWidth = roomWidth / 4;
        const sectionLength = roomLength / 4;
        
        const x = (col - 1) * sectionWidth * 1.2;
        const z = (row - 1) * sectionLength * 1.2;
        
        return (
          <group key={`pedestal-${i}`}>
            {/* Pedestal */}
            <mesh position={[x, 0.5, z]} castShadow receiveShadow>
              <boxGeometry args={[30, 1, 30]} />
              <meshStandardMaterial
                color={colors.pedestal}
                metalness={0.1}
                roughness={0.3}
              />
            </mesh>
            
            {/* Accent lighting */}
            <spotLight
              position={[x, 50, z]}
              angle={0.3}
              penumbra={0.8}
              intensity={2}
              color="#ffffff"
              distance={100}
              castShadow
              shadow-bias={-0.001}
            />
            
            {/* Modern display case */}
            <mesh 
              position={[x, 11, z]} 
              castShadow 
              receiveShadow
              userData={{ type: 'glass-case' }}
            >
              <boxGeometry args={[20, 20, 20]} />
              <meshStandardMaterial 
                color={colors.glass}
                metalness={0.3}
                roughness={0.2}
                transparent={true}
                opacity={0.3}
                emissive="#000000"
                emissiveIntensity={0.5}
              />
            </mesh>
            
            {/* Colored ambient light for atmosphere */}
            <pointLight
              position={[x, 15, z]}
              distance={30}
              intensity={0.5}
              color={
                new THREE.Color(0.5 + Math.random() * 0.5, 0.5 + Math.random() * 0.5, 0.5 + Math.random() * 0.5)
              }
            />
          </group>
        )
      })}
      
      {/* Stairs (series of boxes) */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh
          key={`stair-step-${i}`}
          position={[roomWidth / 2 - 100 + i * 8, 2 + i * 2, roomLength / 2 - 80]}
          castShadow
          receiveShadow
          userData={{ type: 'hard-structure' }}
        >
          <boxGeometry args={[8, 2, 30]} />
          <meshStandardMaterial color="#bca16b" metalness={0.2} roughness={0.5} />
        </mesh>
      ))}

      {/* Floating platform */}
      <mesh position={[roomWidth / 2 - 60, 22, roomLength / 2 - 80]} castShadow receiveShadow userData={{ type: 'hard-structure' }}>
        <boxGeometry args={[30, 2, 30]} />
        <meshStandardMaterial color="#7ecfff" metalness={0.3} roughness={0.2} />
      </mesh>
      
      {/* Decorative pillars distributed around the gallery */}
      {/* Central pillars */}
      {Array.from({ length: 6 }).map((_, i) => {
        // Adjust positioning to move pillars away from walls
        // Use more precise calculation to ensure they're well-positioned
        const pillarOffsetFromWall = 30; // Distance from wall
        
        // Calculate position in a way that ensures pillars are evenly distributed
        const totalWidth = roomWidth - (pillarOffsetFromWall * 2);
        const totalLength = roomLength - (pillarOffsetFromWall * 2);
        
        const cols = 3;
        const rows = 2;
        
        const colSpacing = totalWidth / (cols - 1);
        const rowSpacing = totalLength / (rows - 1);
        
        const col = i % 3;
        const row = Math.floor(i / 3);
        
        // Calculate evenly distributed positions with offset from walls
        const x = (col * colSpacing) - (totalWidth / 2);
        const z = (row * rowSpacing) - (totalLength / 2);
        
        return (
          <group key={`pillar-${i}`}>
            {/* Main pillar column */}
            <mesh 
              position={[x, roomHeight / 2, z]}
              castShadow 
              receiveShadow
            >
              <cylinderGeometry args={[8, 10, roomHeight, 16]} />
              <meshStandardMaterial 
                color={colors.pillar}
                metalness={0.2}
                roughness={0.7}
                emissive="#000000"
                emissiveIntensity={0.3}
              />
            </mesh>
            
            {/* Base */}
            <mesh 
              position={[x, 5, z]}
              castShadow 
              receiveShadow
            >
              <cylinderGeometry args={[12, 14, 10, 16]} />
              <meshStandardMaterial 
                color={colors.trim}
                metalness={0.6}
                roughness={0.3}
                emissive="#000000"
                emissiveIntensity={0.2}
              />
            </mesh>
            
            {/* Capital */}
            <mesh 
              position={[x, roomHeight - 5, z]}
              castShadow 
              receiveShadow
            >
              <cylinderGeometry args={[12, 8, 10, 16]} />
              <meshStandardMaterial 
                color={colors.trim}
                metalness={0.6}
                roughness={0.3}
                emissive="#000000"
                emissiveIntensity={0.2}
              />
            </mesh>
            
            {/* Decorative ring 1 */}
            <mesh 
              position={[x, roomHeight / 4, z]}
              castShadow 
              receiveShadow
            >
              <torusGeometry args={[10, 2, 16, 32]} />
              <meshStandardMaterial 
                color={colors.trim}
                metalness={0.6}
                roughness={0.3}
                emissive="#000000"
                emissiveIntensity={0.2}
              />
            </mesh>
            
            {/* Decorative ring 2 */}
            <mesh 
              position={[x, roomHeight * 3/4, z]}
              castShadow 
              receiveShadow
            >
              <torusGeometry args={[10, 2, 16, 32]} />
              <meshStandardMaterial 
                color={colors.trim}
                metalness={0.6}
                roughness={0.3}
                emissive="#000000"
                emissiveIntensity={0.2}
              />
            </mesh>
          </group>
        )
      })}
      
      {/* Wall pillars along perimeter */}
      {/* Front wall pillars */}
      {Array.from({ length: 5 }).map((_, i) => {
        const x = (i - 2) * 80;
        return (
          <group key={`front-wall-pillar-${i}`}>
            {/* Half column against wall */}
            <mesh 
              position={[x, roomHeight / 2, -roomLength / 2 + 7]}
              rotation={[0, 0, 0]}
              castShadow 
              receiveShadow
            >
              <cylinderGeometry args={[6, 7, roomHeight, 16, 1, false, 0, Math.PI]} />
              <meshStandardMaterial 
                color={colors.pillar}
                metalness={0.2}
                roughness={0.7}
                emissive="#000000"
                emissiveIntensity={0.3}
              />
            </mesh>
            
            {/* Base */}
            <mesh 
              position={[x, 5, -roomLength / 2 + 7]}
              rotation={[0, 0, 0]}
              castShadow 
              receiveShadow
            >
              <cylinderGeometry args={[8, 9, 10, 16, 1, false, 0, Math.PI]} />
              <meshStandardMaterial 
                color={colors.trim}
                metalness={0.6}
                roughness={0.3}
                emissive="#000000"
                emissiveIntensity={0.2}
              />
            </mesh>
            
            {/* Capital */}
            <mesh 
              position={[x, roomHeight - 5, -roomLength / 2 + 7]}
              rotation={[0, 0, 0]}
              castShadow 
              receiveShadow
            >
              <cylinderGeometry args={[8, 6, 10, 16, 1, false, 0, Math.PI]} />
              <meshStandardMaterial 
                color={colors.trim}
                metalness={0.6}
                roughness={0.3}
                emissive="#000000"
                emissiveIntensity={0.2}
              />
            </mesh>
          </group>
        )
      })}
      
      {/* Back wall pillars */}
      {Array.from({ length: 5 }).map((_, i) => {
        const x = (i - 2) * 80;
        return (
          <group key={`back-wall-pillar-${i}`}>
            {/* Half column against wall */}
            <mesh 
              position={[x, roomHeight / 2, roomLength / 2 - 7]}
              rotation={[0, Math.PI, 0]}
              castShadow 
              receiveShadow
            >
              <cylinderGeometry args={[6, 7, roomHeight, 16, 1, false, 0, Math.PI]} />
              <meshStandardMaterial 
                color={colors.pillar}
                metalness={0.2}
                roughness={0.7}
                emissive="#000000"
                emissiveIntensity={0.3}
              />
            </mesh>
            
            {/* Base */}
            <mesh 
              position={[x, 5, roomLength / 2 - 7]}
              rotation={[0, Math.PI, 0]}
              castShadow 
              receiveShadow
            >
              <cylinderGeometry args={[8, 9, 10, 16, 1, false, 0, Math.PI]} />
              <meshStandardMaterial 
                color={colors.trim}
                metalness={0.6}
                roughness={0.3}
                emissive="#000000"
                emissiveIntensity={0.2}
              />
            </mesh>
            
            {/* Capital */}
            <mesh 
              position={[x, roomHeight - 5, roomLength / 2 - 7]}
              rotation={[0, Math.PI, 0]}
              castShadow 
              receiveShadow
            >
              <cylinderGeometry args={[8, 6, 10, 16, 1, false, 0, Math.PI]} />
              <meshStandardMaterial 
                color={colors.trim}
                metalness={0.6}
                roughness={0.3}
                emissive="#000000"
                emissiveIntensity={0.2}
              />
            </mesh>
          </group>
        )
      })}
      
      {/* Modern architectural elements - main central columns */}
      {Array.from({ length: 3 }).map((_, i) => {
        const x = roomWidth / 4 * (i - 1);
        return (
          <mesh 
            key={`column-${i}`}
            position={[x, roomHeight / 2, 0]}
            castShadow
            receiveShadow
          >
            <cylinderGeometry args={[5, 5, roomHeight, 32]} />
            <meshStandardMaterial 
              color="#f5f5f5"
              metalness={0.2}
              roughness={0.8}
              emissive="#000000"
              emissiveIntensity={0.3}
            />
          </mesh>
        )
      })}
      
      {/* Ambient lighting */}
      <ambientLight intensity={1.0} />
      
      {/* Main lighting */}
      <directionalLight 
        position={[0, roomHeight - 20, 0]} 
        intensity={0.8} 
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-roomWidth/2}
        shadow-camera-right={roomWidth/2}
        shadow-camera-top={roomLength/2}
        shadow-camera-bottom={-roomLength/2}
      />
      
      {/* Soft fill lights */}
      <hemisphereLight args={['#fff9ee', '#002244', 1.2]} />
      
      {/* Night mode lighting */}
      {/* Removed night mode lighting as per edit hint */}
    </group>
  )
} 