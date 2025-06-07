"use client"

import { useEffect, useRef } from "react"
import Chart from "chart.js/auto"

interface ChartProps {
  data: any[]
  xKey: string
  yKey: string
  xLabel: string
  yLabel: string
}

export function LineChart({ data, xKey, yKey, xLabel, yLabel }: ChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    // Destroy previous chart instance
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: data.map((item) => item[xKey]),
        datasets: [
          {
            label: yLabel,
            data: data.map((item) => item[yKey]),
            borderColor: "rgb(59, 130, 246)",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            tension: 0.1,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: xLabel,
            },
          },
          y: {
            title: {
              display: true,
              text: yLabel,
            },
            beginAtZero: true,
          },
        },
      },
    })

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [data, xKey, yKey, xLabel, yLabel])

  return <canvas ref={chartRef} style={{ height: "300px" }} />
}

export function BarChart({ data, xKey, yKey, xLabel, yLabel }: ChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    // Destroy previous chart instance
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    chartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: data.map((item) => item[xKey]),
        datasets: [
          {
            label: yLabel,
            data: data.map((item) => item[yKey]),
            backgroundColor: "rgb(59, 130, 246)",
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: xLabel,
            },
          },
          y: {
            title: {
              display: true,
              text: yLabel,
            },
            beginAtZero: true,
          },
        },
      },
    })

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [data, xKey, yKey, xLabel, yLabel])

  return <canvas ref={chartRef} style={{ height: "300px" }} />
} 