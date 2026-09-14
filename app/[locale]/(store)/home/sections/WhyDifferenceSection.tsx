"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { Badge } from "@/shared/ui/Badge";
import { ScrollReveal } from "@/shared/ui/ScrollReveal";

type FeatureKey =
  | "support"
  | "range"
  | "partnership"
  | "delivery"
  | "quality"
  | "pricing";

const LEFT_FEATURES: FeatureKey[] = ["support", "range", "partnership"];
const RIGHT_FEATURES: FeatureKey[] = ["delivery", "quality", "pricing"];

// Shared coordinate space (0-100, both axes) for the dots, elbow connectors and
// the circle itself, so every piece lines up exactly instead of being
// positioned by two different layout systems.
const DOT_X = { left: 26, right: 74 };
const CIRCLE_EDGE_X = { left: 37, right: 63 };
const ROW_Y = [18, 50, 82]; // top / middle / bottom label + dot height
const TARGET_Y = [30, 50, 70]; // height at which each connector enters the circle
// Fraction of the dot-to-circle horizontal gap covered by the flat lead-in
// segment before the line kinks and angles diagonally into the circle.
const BEND_FRACTION = 0.45;

type Line = { dotX: number; y1: number; bendX: number; edgeX: number; y2: number };

const LEFT_LINES: Line[] = ROW_Y.map((y, i) => ({
  dotX: DOT_X.left,
  y1: y,
  bendX: DOT_X.left + (CIRCLE_EDGE_X.left - DOT_X.left) * BEND_FRACTION,
  edgeX: CIRCLE_EDGE_X.left,
  y2: TARGET_Y[i],
}));
const RIGHT_LINES: Line[] = ROW_Y.map((y, i) => ({
  dotX: DOT_X.right,
  y1: y,
  bendX: DOT_X.right + (CIRCLE_EDGE_X.right - DOT_X.right) * BEND_FRACTION,
  edgeX: CIRCLE_EDGE_X.right,
  y2: TARGET_Y[i],
}));

export default function WhyDifferenceSection() {
  const t = useTranslations("home");

  const feature = (key: FeatureKey) => ({
    title: t(`whyDifference.features.${key}.title`),
    desc: t(`whyDifference.features.${key}.desc`),
  });

  return (
    <section className="py-20 md:py-28 bg-background relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal
          animation="fade"
          className="flex flex-col items-center text-center gap-4 mb-16 md:mb-20"
        >
          <Badge className="rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest">
            {t("whyDifference.badge")}
          </Badge>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight title-gradient">
            {t("whyDifference.title")}
          </h2>
        </ScrollReveal>

        {/* Mobile / tablet: stacked circle + simple list */}
        <div className="flex flex-col items-center gap-10 lg:hidden">
          <CenterCircle />
          <div className="flex flex-col items-center gap-8 max-w-sm text-center">
            {LEFT_FEATURES.map((key) => (
              <FeatureText key={key} {...feature(key)} align="center" />
            ))}
          </div>
        </div>

        {/* Desktop: circle with elbow connectors fanning to both columns.
            dir="ltr" keeps the diagram's geometry (dots/lines/circle) fixed
            regardless of locale; text alignment below is set physically
            (text-right/text-left) so Arabic still reads correctly. */}
        <div dir="ltr" className="hidden lg:block relative h-95">
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full text-border"
          >
            {[...LEFT_LINES, ...RIGHT_LINES].map((line, i) => (
              <path
                key={i}
                d={`M ${line.dotX} ${line.y1} L ${line.bendX} ${line.y1} L ${line.edgeX} ${line.y2}`}
                fill="none"
                stroke="currentColor"
                strokeWidth={0.3}
              />
            ))}
          </svg>

          {LEFT_FEATURES.map((key, i) => (
            <Dot key={key} x={DOT_X.left} y={ROW_Y[i]} />
          ))}
          {RIGHT_FEATURES.map((key, i) => (
            <Dot key={key} x={DOT_X.right} y={ROW_Y[i]} />
          ))}

          {LEFT_FEATURES.map((key, i) => (
            <div
              key={key}
              className="absolute w-64 pe-5"
              style={{
                right: `${100 - DOT_X.left}%`,
                top: `${ROW_Y[i]}%`,
                transform: "translateY(-50%)",
              }}
            >
              <FeatureText {...feature(key)} align="right" />
            </div>
          ))}

          {RIGHT_FEATURES.map((key, i) => (
            <div
              key={key}
              className="absolute w-64 ps-5"
              style={{
                left: `${DOT_X.right}%`,
                top: `${ROW_Y[i]}%`,
                transform: "translateY(-50%)",
              }}
            >
              <FeatureText {...feature(key)} align="left" />
            </div>
          ))}

          <div
            className="absolute left-1/2 top-1/2 z-10"
            style={{ transform: "translate(-50%, -50%)" }}
          >
            <CenterCircle />
          </div>
        </div>
      </div>
    </section>
  );
}

function Dot({ x, y }: { x: number; y: number }) {
  return (
    <span
      className="absolute w-2.5 h-2.5 rounded-full bg-primary z-10"
      style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}
    />
  );
}

function FeatureText({
  title,
  desc,
  align,
}: {
  title: string;
  desc: string;
  align: "left" | "right" | "center";
}) {
  return (
    <div
      className={
        align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left"
      }
    >
      <h4 className="text-lg font-black title-gradient mb-1">{title}</h4>
      <p className="text-sm text-muted-foreground font-medium">{desc}</p>
    </div>
  );
}

function CenterCircle() {
  return (
    <div className="relative w-56 h-56 md:w-72 md:h-72 rounded-full bg-primary/5 ring-8 ring-primary/5 flex items-center justify-center shrink-0">
      <div className="relative w-[calc(100%-1.5rem)] h-[calc(100%-1.5rem)] rounded-full overflow-hidden shadow-xl ring-4 ring-background">
        <Image
          src="/assets/images/auth-logo.png"
          alt=""
          fill
          className="object-cover"
          sizes="288px"
        />
      </div>
    </div>
  );
}
