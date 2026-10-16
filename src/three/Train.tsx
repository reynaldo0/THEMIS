import { useMemo } from "react";
import { GlbCarriage } from "@/three/GlbCarriage";
import { CAR_STRIDE } from "@/three/models";
import { useThemisStore } from "@/store/useThemisStore";

export function Train() {
  const cars = useThemisStore((s) => s.cars);
  const doorStates = useThemisStore((s) => s.doorStates);
  const selectedCarId = useThemisStore((s) => s.selectedCarId);
  const hoveredCarId = useThemisStore((s) => s.hoveredCarId);
  const selectCar = useThemisStore((s) => s.selectCar);
  const hoverCar = useThemisStore((s) => s.hoverCar);

  const positions = useMemo(() => {
    const total = cars.length * CAR_STRIDE - (CAR_STRIDE - 5.27);
    const start = -total / 2 + 5.27 / 2;
    return cars.map((_, i) => start + i * CAR_STRIDE);
  }, [cars.length]);

  return (
    <group>
      {cars.map((car, i) => (
        <GlbCarriage
          key={car.carId}
          car={car}
          door={doorStates[car.carId]}
          position={[positions[i], 0, 0]}
          isSelected={selectedCarId === car.carId}
          isHovered={hoveredCarId === car.carId}
          onSelect={selectCar}
          onHover={hoverCar}
        />
      ))}
    </group>
  );
}
