"use client";
import * as React from "react";

export class WebGLErrorBoundary extends React.Component<{ fallback: React.ReactNode, children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() { return this.state.hasError ? this.props.fallback : this.props.children; }
}

export function WebGLFallback({ className }: { className?: string }) {
  return <div className={`bg-gradient-to-br from-slate-950 to-slate-900 ${className || ""}`} />;
}
