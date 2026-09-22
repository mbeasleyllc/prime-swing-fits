import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type MeasurementType =
  | "wrist-to-floor"
  | "hand-length"
  | "finger-length"
  | "glove-size"
  | "swing-speed"
  | "tempo"
  | "transition"
  | "toe"
  | "heel"
  | "thin"
  | "fat"
  | "face-rotation"
  | "toe-hang"
  | "bounce"
  | "choke-down"
  | "strike-pattern"
  | "eye-position"
  | "arm-hang"
  | "sole-flush"
  | "stroke-arc";

interface MeasurementTooltipProps {
  type: MeasurementType;
  className?: string;
}

const tooltipContent: Record<MeasurementType, { title: string; description: string; diagram?: string }> = {
  "wrist-to-floor": {
    title: "Wrist-to-Floor Measurement",
    description: "Stand naturally with shoes on, arms hanging relaxed. Measure from the wrist crease where your hand bends to the floor. Used to determine optimal club length.",
  },
  "hand-length": {
    title: "Hand Length",
    description: "Place hand flat, measure from where your hand meets your wrist to the tip of your middle finger. Used for precise grip sizing.",
  },
  "finger-length": {
    title: "Longest Finger",
    description: "Measure from the base knuckle to the fingertip of your longest finger. Used for grip thickness recommendations.",
  },
  "glove-size": {
    title: "Golf Glove Size",
    description: "Your standard golf glove size. If unsure, measure hand circumference at knuckles: under 7\"=S, 7-7.5\"=M, 7.5-8\"=ML, 8-8.5\"=L, over 8.5\"=XL.",
  },
  "thin": {
    title: "Thin Contact",
    description: "Striking the ball with the leading edge of the club, typically resulting in low shots with reduced distance.",
  },
  "fat": {
    title: "Fat Contact",
    description: "Making contact with the ground before the ball, causing heavy shots with significant distance loss.",
  },
  "toe": {
    title: "Toe Strike",
    description: "Hitting the ball on the outer edge (toe) of the clubface, usually producing weak fades or pushes.",
  },
  "heel": {
    title: "Heel Strike",
    description: "Hitting the ball on the inner edge (heel) of the clubface, often resulting in pulls or hooks.",
  },
  "face-rotation": {
    title: "Face Rotation",
    description: "How much the putter face opens and closes during your stroke. More rotation suits arcing strokes.",
  },
  "toe-hang": {
    title: "Toe Hang",
    description: "The balance point of the putter. High toe hang suits arcing strokes, while face-balanced suits straight-back-straight-through strokes.",
  },
  "bounce": {
    title: "Wedge Bounce",
    description: "The angle between the leading edge and lowest point of the sole. More bounce prevents digging; less bounce suits firm conditions.",
  },
  "swing-speed": {
    title: "Driver Swing Speed",
    description: "How fast the clubhead moves at impact. Determines shaft flex and club specifications. Average male: 90-95 mph, female: 65-70 mph.",
  },
  "tempo": {
    title: "Swing Tempo",
    description: "The overall pace of your swing. Smooth: slower, rhythmic. Moderate: athletic, balanced. Aggressive: quick, powerful.",
  },
  "transition": {
    title: "Transition Speed",
    description: "How quickly you change direction from backswing to downswing. Smooth: gradual. Average: balanced. Quick/Aggressive: explosive.",
  },
  "choke-down": {
    title: "Choke Down",
    description: "Gripping down on the club shaft for more control. Common when clubs feel too long.",
  },
  "strike-pattern": {
    title: "Strike Pattern",
    description: "Where the ball contacts the clubface. Toe = outer edge, Heel = inner edge, Thin = below center, Fat = ground before ball.",
  },
  "eye-position": {
    title: "Eye Position at Address",
    description: "Where your eyes are positioned relative to the ball at address. Affects your perception of the putting line.",
  },
  "arm-hang": {
    title: "Arm Hang",
    description: "How your arms hang from your shoulders at address. Natural hang promotes a consistent stroke path.",
  },
  "sole-flush": {
    title: "Sole Flush at Address",
    description: "Whether the putter sole sits flat on the ground or tilted (toe up/heel up) at address. Affects impact angle.",
  },
  "stroke-arc": {
    title: "Stroke Arc/Pattern",
    description: "The path your putter head takes. Straight = minimal arc, Arc = inside-to-square-to-inside like full swing.",
  },
};

export function MeasurementTooltip({ type, className = "" }: MeasurementTooltipProps) {
  const content = tooltipContent[type];

  if (!content) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={`inline-flex items-center justify-center text-muted-foreground hover:text-accent transition-colors ${className}`}
            aria-label={`Help: ${content.title}`}
          >
            <Info className="h-4 w-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-2">
            <p className="font-semibold text-sm">{content.title}</p>
            <p className="text-sm text-muted-foreground">{content.description}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}