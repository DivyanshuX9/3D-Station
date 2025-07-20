import { Html } from '@react-three/drei'

export const LoadingScreen = () => {
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-xl font-semibold text-blue-500">Loading Gallery...</p>
      </div>
    </Html>
  )
} 