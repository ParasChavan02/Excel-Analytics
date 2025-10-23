import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Box } from '@react-three/drei';
import * as THREE from 'three';

// 3D Bar Chart Component
function Bar3D({ position, height, color, label, value }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group position={position}>
      <Box
        ref={meshRef}
        args={[0.8, height, 0.8]}
        position={[0, height / 2, 0]}
      >
        <meshStandardMaterial color={color} />
      </Box>
      <Text
        position={[0, -0.5, 0]}
        fontSize={0.3}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
      <Text
        position={[0, height + 0.3, 0]}
        fontSize={0.25}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        {value}
      </Text>
    </group>
  );
}

// 3D Pie Chart Segment
function PieSegment3D({ 
  innerRadius = 0.5, 
  outerRadius = 2, 
  startAngle, 
  endAngle, 
  color, 
  height = 0.5,
  label,
  value 
}) {
  const meshRef = useRef();
  
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    const x = innerRadius * Math.cos(startAngle);
    const y = innerRadius * Math.sin(startAngle);
    
    shape.moveTo(x, y);
    shape.lineTo(outerRadius * Math.cos(startAngle), outerRadius * Math.sin(startAngle));
    
    shape.absarc(0, 0, outerRadius, startAngle, endAngle, false);
    shape.lineTo(innerRadius * Math.cos(endAngle), innerRadius * Math.sin(endAngle));
    
    if (innerRadius > 0) {
      shape.absarc(0, 0, innerRadius, endAngle, startAngle, true);
    }
    
    const extrudeSettings = {
      depth: height,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 2,
      bevelSize: 0.05,
      bevelThickness: 0.05
    };
    
    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, [innerRadius, outerRadius, startAngle, endAngle, height]);

  const midAngle = (startAngle + endAngle) / 2;
  const labelRadius = outerRadius + 0.5;

  return (
    <group>
      <mesh ref={meshRef} geometry={geometry}>
        <meshStandardMaterial color={color} />
      </mesh>
      <Text
        position={[
          labelRadius * Math.cos(midAngle),
          labelRadius * Math.sin(midAngle),
          height / 2
        ]}
        fontSize={0.25}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        {label}: {value}
      </Text>
    </group>
  );
}

// 3D Surface Plot
function Surface3D({ data, width = 10, height = 10 }) {
  const geometry = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(width, height, data.length - 1, data[0].length - 1);
    const vertices = geometry.attributes.position.array;
    
    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < data[i].length; j++) {
        const index = (i * data[i].length + j) * 3;
        vertices[index + 2] = data[i][j] * 2; // Z coordinate (height)
      }
    }
    
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
    return geometry;
  }, [data, width, height]);

  return (
    <mesh geometry={geometry} rotation={[-Math.PI / 3, 0, 0]}>
      <meshStandardMaterial 
        color="#4299e1" 
        wireframe={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// Main 3D Chart Renderer
const Chart3DRenderer = ({ 
  chartData, 
  chartType, 
  title, 
  customization = {},
  width = 600, 
  height = 400 
}) => {
  const { 
    backgroundColor = '#f7fafc',
    showGrid = true,
    animation = true,
    colorScheme = 'default'
  } = customization;

  const colors = {
    default: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
    vibrant: ['#FF4757', '#3742FA', '#2ED573', '#FFA502', '#A4B0BE', '#FF3838'],
    pastel: ['#FFB3BA', '#BAFFC9', '#BAE1FF', '#FFFFBA', '#FFDFBA', '#E0BBE4'],
    dark: ['#2C3E50', '#E74C3C', '#3498DB', '#F39C12', '#9B59B6', '#1ABC9C']
  };

  const selectedColors = colors[colorScheme] || colors.default;

  const renderChart = () => {
    if (!chartData || !chartData.labels || !chartData.datasets) {
      return (
        <Text position={[0, 0, 0]} fontSize={0.5} color="red">
          Invalid Chart Data
        </Text>
      );
    }

    const labels = chartData.labels;
    const values = chartData.datasets[0]?.data || [];

    switch (chartType.toLowerCase()) {
      case '3d-bar':
      case 'bar3d':
        return labels.map((label, index) => (
          <Bar3D
            key={index}
            position={[(index - labels.length / 2) * 2, 0, 0]}
            height={values[index] || 1}
            color={selectedColors[index % selectedColors.length]}
            label={label}
            value={values[index]}
          />
        ));

      case '3d-pie':
      case 'pie3d':
        const total = values.reduce((sum, val) => sum + val, 0);
        let currentAngle = 0;
        
        return labels.map((label, index) => {
          const value = values[index];
          const angle = (value / total) * Math.PI * 2;
          const startAngle = currentAngle;
          const endAngle = currentAngle + angle;
          currentAngle += angle;

          return (
            <PieSegment3D
              key={index}
              startAngle={startAngle}
              endAngle={endAngle}
              color={selectedColors[index % selectedColors.length]}
              label={label}
              value={value}
            />
          );
        });

      case '3d-surface':
      case 'surface3d':
        // Generate sample surface data if not provided
        const surfaceData = Array(10).fill().map(() => 
          Array(10).fill().map(() => Math.random() * 3)
        );
        return <Surface3D data={surfaceData} />;

      default:
        return (
          <Text position={[0, 0, 0]} fontSize={0.5} color="orange">
            Unsupported 3D Chart Type
          </Text>
        );
    }
  };

  return (
    <div style={{ width, height, backgroundColor, borderRadius: '10px', overflow: 'hidden' }}>
      {title && (
        <div style={{ 
          textAlign: 'center', 
          padding: '10px', 
          fontSize: '18px', 
          fontWeight: 'bold',
          background: 'rgba(255,255,255,0.9)'
        }}>
          {title}
        </div>
      )}
      <Canvas
        camera={{ position: [8, 8, 8], fov: 50 }}
        style={{ background: backgroundColor }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} />
        
        {showGrid && (
          <gridHelper args={[20, 20, '#cccccc', '#eeeeee']} />
        )}
        
        {renderChart()}
        
        <OrbitControls 
          enablePan={true} 
          enableZoom={true} 
          enableRotate={true}
          autoRotate={animation}
          autoRotateSpeed={2}
        />
      </Canvas>
    </div>
  );
};

export default Chart3DRenderer;