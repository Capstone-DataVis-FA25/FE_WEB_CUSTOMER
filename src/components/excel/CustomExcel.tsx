"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import * as XLSX from "xlsx"
import saveAs from "file-saver"
import {
  Undo,
  Redo,
  Plus,
  Copy,
  Download,
  Trash2,
  FileText,
  FileDigit,
  Sigma,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// =============== Types & Helpers =================
export interface Column {
  name: string
  type: "string" | "number" | "decimal"
  width?: number
}
interface CustomExcelProps {
  initialData?: string[][]
  initialColumns?: Column[]
  onDataChange?: (d: string[][], c: Column[]) => void
  className?: string
  mode?: "edit" | "view"
}
interface HistoryEntry {
  data: string[][]
  columns: Column[]
}
const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v))
const DEFAULT_WIDTH = 180
const COLUMN_TYPES = [
  { label: "Text", value: "string", icon: <FileText size={14} /> },
  { label: "Number", value: "number", icon: <FileDigit size={14} /> },
  { label: "Decimal", value: "decimal", icon: <Sigma size={14} /> },
]

// =============== Component =================
const DEFAULT_COLS: Column[] = [
  { name: "Column 1", type: "string", width: 200 },
  { name: "Column 2", type: "string", width: 200 },
]
const DEFAULT_ROWS: string[][] = Array.from({ length: 8 }, () => Array(DEFAULT_COLS.length).fill(""))

const CustomExcel: React.FC<CustomExcelProps> = ({
  initialData = DEFAULT_ROWS,
  initialColumns = DEFAULT_COLS,
  onDataChange,
  className = "",
  mode = "edit",
}) => {
  // Core state
  const [columns, setColumns] = useState<Column[]>([])
  const [data, setData] = useState<string[][]>([])
  const [filters, setFilters] = useState<string[]>([])
  const [globalFilter, setGlobalFilter] = useState("")

  const [sortConfig, setSortConfig] = useState<{ column: number; direction: "asc" | "desc" } | null>(null)

  const [selectedRow, setSelectedRow] = useState<number | null>(null)
  const [selectedColumn, setSelectedColumn] = useState<number | null>(null)

  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  // Initialization
  useEffect(() => {
    const initCols = (initialColumns.length ? initialColumns : DEFAULT_COLS).map((c) => ({
      ...c,
      width: c.width || DEFAULT_WIDTH,
    }))
    const initData = initialData.length ? initialData : DEFAULT_ROWS.map(() => Array(initCols.length).fill(""))
    setColumns(initCols)
    setData(initData)
    setFilters(Array(initCols.length).fill(""))
    // Don't initialize history here - let commit handle it
  }, [initialColumns, initialData])

  useEffect(() => {
    if (history.length === 0 && columns.length > 0 && data.length > 0) {
      const first: HistoryEntry = { data: clone(data), columns: clone(columns) }
      setHistory([first])
      setHistoryIndex(0)
    }
  }, [columns, data, history.length])

  const commit = useCallback(
    (nextData: string[][], nextCols: Column[], skipHistory = false) => {
      setData(nextData)
      setColumns(nextCols)
      if (!skipHistory) {
        const entry: HistoryEntry = { data: clone(nextData), columns: clone(nextCols) }
        setHistory((prev) => {
          const trimmed = prev.slice(0, historyIndex + 1)
          const newHistory = [...trimmed, entry]
          return newHistory
        })
        setHistoryIndex((i) => {
          const newIndex = i + 1
          return newIndex
        })
        onDataChange && onDataChange(nextData, nextCols)
      }
    },
    [historyIndex, onDataChange],
  )

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const idx = historyIndex - 1
      const st = history[idx]
      setHistoryIndex(idx)
      setData(clone(st.data))
      setColumns(clone(st.columns))
      setFilters(Array(st.columns.length).fill(""))
      setSelectedRow(null)
      setSelectedColumn(null)
      setSortConfig(null)
      onDataChange && onDataChange(st.data, st.columns)
    } else {
    }
  }, [historyIndex, history, onDataChange])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const idx = historyIndex + 1
      const st = history[idx]
      setHistoryIndex(idx)
      setData(clone(st.data))
      setColumns(clone(st.columns))
      setFilters(Array(st.columns.length).fill(""))
      setSelectedRow(null)
      setSelectedColumn(null)
      setSortConfig(null)
      onDataChange && onDataChange(st.data, st.columns)
    } else {
    }
  }, [historyIndex, history, onDataChange])

  useEffect(() => {
    if (mode === "edit") {
      const handleKeyDown = (e: KeyboardEvent) => {
        const target = e.target as HTMLElement

        // Skip if user is typing in input fields
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
          return
        }

        // Handle Ctrl+Z (Undo)
        if (e.ctrlKey && e.key === "z" && !e.shiftKey) {
          e.preventDefault()
          e.stopPropagation()
          undo()
          return
        }

        // Handle Ctrl+Y or Ctrl+Shift+Z (Redo)
        if (e.ctrlKey && (e.key === "y" || (e.shiftKey && e.key === "z"))) {
          e.preventDefault()
          e.stopPropagation()
          redo()
          return
        }
      }

      document.addEventListener("keydown", handleKeyDown, true)
      return () => document.removeEventListener("keydown", handleKeyDown, true)
    }
  }, [undo, redo, mode])

  // Generic mutation helpers
  const setCell = (r: number, c: number, val: string) => {
    const nd = clone(data)
    nd[r][c] = val
    commit(nd, columns)
  }
  const setHeader = (c: number, val: string) => {
    const nc = clone(columns)
    nc[c].name = val
    commit(data, nc)
  }
  const setType = (c: number, val: "string" | "number" | "decimal") => {
    const nc = clone(columns)
    nc[c].type = val
    commit(data, nc)
  }

  // Add/remove
  const addRow = () => {
    if (mode === "view") return
    const nd = clone(data)
    nd.push(Array(columns.length).fill(""))
    commit(nd, columns)
  }
  const addColumn = () => {
    if (mode === "view") return
    const nc = clone(columns)
    nc.push({ name: `Column ${nc.length + 1}`, type: "string", width: DEFAULT_WIDTH })
    const nd = clone(data)
    nd.forEach((r) => r.push(""))
    commit(nd, nc)
    setFilters((f) => [...f, ""])
  }

  const removeRow = (r: number) => {
    if (mode === "view" || data.length <= 1) return
    const nd = clone(data)
    nd.splice(r, 1)
    setSelectedRow(null)
    commit(nd, columns)
  }

  const removeColumn = (c: number) => {
    if (mode === "view" || columns.length <= 1) return
    const nc = clone(columns)
    nc.splice(c, 1)
    const nd = clone(data)
    nd.forEach((r) => r.splice(c, 1))
    setSelectedColumn(null)
    setSortConfig(null)
    commit(nd, nc)
    setFilters((f) => f.filter((_, i) => i !== c))
  }

  const deleteSelectedRow = () => {
    if (selectedRow !== null) {
      removeRow(selectedRow)
    }
  }

  const deleteSelectedColumn = () => {
    if (selectedColumn !== null) {
      removeColumn(selectedColumn)
    }
  }

  const handleSort = (columnIndex: number) => {
    if (mode === "view") return

    let direction: "asc" | "desc" = "asc"
    if (sortConfig && sortConfig.column === columnIndex && sortConfig.direction === "asc") {
      direction = "desc"
    }

    setSortConfig({ column: columnIndex, direction })

    const nd = clone(data)
    const columnType = columns[columnIndex].type

    nd.sort((a, b) => {
      const aVal = a[columnIndex] || ""
      const bVal = b[columnIndex] || ""

      if (columnType === "number" || columnType === "decimal") {
        const aNum = Number.parseFloat(aVal) || 0
        const bNum = Number.parseFloat(bVal) || 0
        return direction === "asc" ? aNum - bNum : bNum - aNum
      } else {
        return direction === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }
    })

    commit(nd, columns)
  }

  // Filters
  const changeFilter = (c: number, v: string) =>
    setFilters((fs) => {
      const nf = [...fs]
      nf[c] = v
      return nf
    })

  const filteredData = data
    .map((row, i) => ({ row, i }))
    .filter(({ row }) => {
      const g = globalFilter
        ? row.some((cell) => String(cell).toLowerCase().includes(globalFilter.toLowerCase()))
        : true
      if (!g) return false
      return row.every((cell, ci) =>
        filters[ci] ? String(cell).toLowerCase().includes(filters[ci].toLowerCase()) : true,
      )
    })

  // Copy / Paste
  const copyAll = () => {
    const txt = [columns.map((c) => c.name), ...data].map((r) => r.join("\t")).join("\n")
    navigator.clipboard.writeText(txt)
  }
  const handlePaste = (e: React.ClipboardEvent<HTMLTableElement>) => {
    if (mode === "view") return
    e.preventDefault()
    const text = e.clipboardData.getData("text")
    const rows = text
      .split(/\r?\n/)
      .filter((r) => r.length > 0)
      .map((r) => r.split("\t"))
    const active = document.activeElement as HTMLElement
    if (!active?.dataset.cell) return
    const [sr, sc] = active.dataset.cell.split("-").map(Number)
    const nd = clone(data)
    rows.forEach((r, i) =>
      r.forEach((cell, j) => {
        const rr = sr + i
        const cc = sc + j
        if (nd[rr] && nd[rr][cc] !== undefined) nd[rr][cc] = cell
      }),
    )
    commit(nd, columns)
  }

  // Export
  const exportXlsx = () => {
    const aoa = [columns.map((c) => c.name), ...data]
    const ws = XLSX.utils.aoa_to_sheet(aoa)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1")
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" })
    saveAs(new Blob([buf]), "data_export.xlsx")
  }

  const totalWidth = Math.max(columns.reduce((s, c) => s + (c.width || DEFAULT_WIDTH), 0) + 120, 1200)

  return (
    <div
      className={`w-full max-w-full p-4 bg-gray-50 dark:bg-gray-900/40 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}
    >
      <div className="flex flex-wrap items-center gap-2 mb-3 p-2 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-600 shadow-sm">
        {mode === "edit" && (
          <>
            <Button size="sm" onClick={addRow} className="gap-1">
              <Plus size={14} /> Row
            </Button>
            <Button size="sm" onClick={addColumn} className="gap-1">
              <Plus size={14} /> Col
            </Button>
            <div className="h-5 w-px bg-gray-300 dark:bg-gray-600" />
            <Button
              size="sm"
              variant="destructive"
              onClick={deleteSelectedRow}
              disabled={selectedRow === null || data.length <= 1}
              className="gap-1"
            >
              <Trash2 size={14} /> Delete Row {selectedRow !== null ? `#${selectedRow + 1}` : ""}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={deleteSelectedColumn}
              disabled={selectedColumn === null || columns.length <= 1}
              className="gap-1"
            >
              <Trash2 size={14} /> Delete Col {selectedColumn !== null ? `"${columns[selectedColumn]?.name}"` : ""}
            </Button>
            <div className="h-5 w-px bg-gray-300 dark:bg-gray-600" />
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.preventDefault()
                undo()
              }}
              disabled={historyIndex <= 0}
              title="Undo (Ctrl+Z)"
            >
              <Undo size={16} />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.preventDefault()
                redo()
              }}
              disabled={historyIndex >= history.length - 1}
              title="Redo (Ctrl+Y)"
            >
              <Redo size={16} />
            </Button>
            <div className="h-5 w-px bg-gray-300 dark:bg-gray-600" />
            <Button size="sm" variant="outline" onClick={copyAll} className="gap-1 bg-transparent">
              <Copy size={14} /> Copy
            </Button>
          </>
        )}
        <Button size="sm" variant="outline" onClick={exportXlsx} className="gap-1 bg-transparent">
          <Download size={14} /> Export
        </Button>
        <div className="flex-grow" />
        <div className="relative">
          <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search..."
            className="pl-7 pr-2 py-1.5 text-sm border rounded-md w-48 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="border rounded-md bg-white dark:bg-gray-800 h-[60vh] relative overflow-hidden">
        <div
          className="w-full h-full overflow-auto"
          style={{
            scrollbarWidth: "auto",
            scrollbarColor: "#94a3b8 #f1f5f9",
          }}
        >
          <table
            className="text-sm border-collapse min-w-full"
            style={{
              tableLayout: "fixed",
              width: totalWidth,
            }}
            onPaste={handlePaste}
          >
            <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0 z-30 select-none">
              <tr>
                <th className="sticky left-0 z-40 bg-gray-100 dark:bg-gray-700 border-r border-b border-gray-300 dark:border-gray-600 w-12 text-center font-semibold">
                  #
                </th>
                {columns.map((col, ci) => (
                  <th
                    key={ci}
                    className={`relative group border-b border-r border-gray-300 dark:border-gray-600 p-2 align-top font-semibold text-gray-700 dark:text-gray-200 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 ${
                      selectedColumn === ci ? "bg-blue-100 dark:bg-blue-900/50" : ""
                    }`}
                    style={{ width: col.width || DEFAULT_WIDTH, minWidth: 150 }}
                    onClick={() => setSelectedColumn(selectedColumn === ci ? null : ci)}
                  >
                    <div className="flex items-center gap-1">
                      {mode === "edit" && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="w-6 h-6 flex-shrink-0">
                              {COLUMN_TYPES.find((t) => t.value === col.type)?.icon}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            {COLUMN_TYPES.map((t) => (
                              <DropdownMenuItem
                                key={t.value}
                                onSelect={() => setType(ci, t.value as any)}
                                className="gap-2"
                              >
                                {t.icon} {t.label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                      <input
                        value={col.name}
                        readOnly={mode === "view"}
                        onChange={(e) => setHeader(ci, e.target.value)}
                        className={`flex-grow bg-transparent font-bold text-sm px-2 py-1 rounded-md min-w-0 ${mode === "edit" ? "focus:outline-none focus:ring-1 focus:ring-blue-500 hover:bg-gray-50 dark:hover:bg-gray-600" : "cursor-default"}`}
                        style={{ maxWidth: "140px" }}
                      />
                      {mode === "edit" && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSort(ci)
                          }}
                          className="w-6 h-6 flex-shrink-0"
                          title="Sort column"
                        >
                          {sortConfig?.column === ci ? (
                            sortConfig.direction === "asc" ? (
                              <ArrowUp size={12} />
                            ) : (
                              <ArrowDown size={12} />
                            )
                          ) : (
                            <ArrowUpDown size={12} />
                          )}
                        </Button>
                      )}
                      {selectedColumn === ci && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedColumn(null)
                          }}
                          className="w-6 h-6 flex-shrink-0"
                        >
                          <X size={12} className="text-blue-500" />
                        </Button>
                      )}
                    </div>
                    {mode === "edit" && (
                      <input
                        value={filters[ci] || ""}
                        onChange={(e) => changeFilter(ci, e.target.value)}
                        placeholder="Filter..."
                        className="w-full text-xs border rounded px-2 py-1 mt-1 bg-white dark:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-400"
                      />
                    )}
                  </th>
                ))}
                <th className="border-b border-gray-300 dark:border-gray-600 w-16 text-center font-semibold">
                  {mode === "edit" ? "Actions" : ""}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map(({ row, i }) => (
                <tr
                  key={i}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                    selectedRow === i ? "bg-blue-100 dark:bg-blue-900/50" : ""
                  }`}
                  onClick={() => setSelectedRow(selectedRow === i ? null : i)}
                >
                  <td className="sticky left-0 z-20 bg-gray-100 dark:bg-gray-700 border-r border-b border-gray-300 dark:border-gray-600 text-center text-gray-600 dark:text-gray-300 px-2 text-xs">
                    {i + 1}
                    {selectedRow === i && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedRow(null)
                        }}
                        className="w-4 h-4 ml-1"
                      >
                        <X size={10} className="text-blue-500" />
                      </Button>
                    )}
                  </td>
                  {columns.map((col, ci) => (
                    <td
                      key={ci}
                      className="border-b border-r border-gray-200 dark:border-gray-600"
                      style={{ width: col.width || DEFAULT_WIDTH, minWidth: 150 }}
                    >
                      <input
                        data-cell={`${i}-${ci}`}
                        value={row[ci] || ""}
                        readOnly={mode === "view"}
                        onChange={(e) => setCell(i, ci, e.target.value)}
                        type={col.type === "number" || col.type === "decimal" ? "number" : "text"}
                        step={col.type === "decimal" ? "any" : undefined}
                        className={`w-full h-full p-2 bg-transparent border-none text-sm ${mode === "edit" ? "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-blue-50 dark:focus:bg-blue-900/40" : "cursor-default"}`}
                      />
                    </td>
                  ))}
                  <td className="border-b border-gray-200 dark:border-gray-600 text-center">
                    {mode === "edit" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeRow(i)
                        }}
                        disabled={data.length <= 1}
                        className="w-7 h-7"
                      >
                        <Trash2 size={15} className="text-gray-500 hover:text-red-500" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <style jsx>{`
          div::-webkit-scrollbar {
            width: 12px;
            height: 12px;
          }
          div::-webkit-scrollbar-track {
            background: #f1f5f9;
            border-radius: 6px;
          }
          div::-webkit-scrollbar-thumb {
            background: #94a3b8;
            border-radius: 6px;
            border: 2px solid #f1f5f9;
          }
          div::-webkit-scrollbar-thumb:hover {
            background: #64748b;
          }
          div::-webkit-scrollbar-corner {
            background: #f1f5f9;
          }
        `}</style>
      </div>

      {mode === "edit" && (
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 space-y-1">
        
          <p>
            History: {historyIndex + 1}/{history.length} states available
            {sortConfig && ` | Sorted by "${columns[sortConfig.column]?.name}" (${sortConfig.direction})`}
          </p>
        </div>
      )}
    </div>
  )
}

export default CustomExcel
