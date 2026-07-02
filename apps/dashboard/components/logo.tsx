import type React from "react";

export const Logo = (props: React.ComponentProps<"svg">) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" {...props}>
    <g fill="currentColor">
      <path
        d="M 50,45 
             L 85,45 
             C 85,45 98,90 98,128 
             C 98,166 85,211 85,211 
             L 50,211 
             C 50,211 63,166 63,128 
             C 63,90 50,45 50,45 Z"
      />

      <path
        d="M 145,45 
             L 225,45 
             L 225,80 
             L 180,80 
             C 158,80 140,100 140,128 
             C 140,156 158,176 180,176 
             L 225,176 
             L 225,211 
             L 145,211 
             C 112,211 99,166 99,128 
             C 99,90 112,45 145,45 Z"
      />
    </g>
  </svg>
);
