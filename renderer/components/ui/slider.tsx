"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "group/slider wora-transition relative flex w-full cursor-pointer touch-none select-none items-center",
      className,
    )}
    {...props}
  >
    <SliderPrimitive.Track className="wora-bg-invert relative h-1 w-full grow overflow-hidden rounded-full">
      <SliderPrimitive.Range className="absolute h-full bg-black dark:bg-white" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-0 w-0 rounded-full bg-black outline-none duration-500 disabled:pointer-events-none disabled:opacity-50 group-hover/slider:h-2 group-hover/slider:w-2 dark:bg-white" />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
