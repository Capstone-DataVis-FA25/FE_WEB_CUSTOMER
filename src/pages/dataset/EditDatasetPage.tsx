"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { ArrowLeft, Save, FileSpreadsheet, Loader2 } from "lucide-react"
import { useDataset } from "@/features/dataset/useDataset"
import { useToastContext } from "@/components/providers/ToastProvider"

import LoadingSpinner from "@/components/ui/LoadingSpinner"
import { SlideInUp } from "@/theme/animation"
import Routers from "@/router/routers"
import { Textarea } from "@/components/ui/textarea"
import CustomExcel from "@/components/excel/CustomExcel"

interface EditFormData {
  name: string
  description: string
  data: string[][]
}

const EditDatasetPage: React.FC = () => {
  const { t } = useTranslation()
  const { id: legacyId, slug } = useParams<{ id?: string; slug?: string }>()
  const location = useLocation() as any
  const stateDatasetId = location?.state?.datasetId as string | undefined
  const rawParam = slug || legacyId || stateDatasetId || ""
  const extractedId = rawParam.split("-").pop() || rawParam
  const navigate = useNavigate()
  const { showSuccess, showError } = useToastContext()

  const { currentDataset, loading, error, updating, getDatasetById, updateDataset } = useDataset()

  const [formData, setFormData] = useState<EditFormData>({
    name: "",
    description: "",
    data: [],
  })

  const [dataChanged, setDataChanged] = useState(false)
  const [formChanged, setFormChanged] = useState(false)

  // Load dataset on mount
  useEffect(() => {
    if (extractedId) {
      getDatasetById(extractedId)
    }
  }, [extractedId, getDatasetById])

  // Update form data when dataset is loaded
  useEffect(() => {
    if (currentDataset) {
      // Convert headers + column data into 2D array (first row header names)
      let twoD: string[][] = []
      if ((currentDataset as any).data) {
        twoD = (currentDataset as any).data
      } else if (currentDataset.headers && currentDataset.headers.length) {
        const headerNames = currentDataset.headers.map((h) => h.name)
        const rowCount = currentDataset.rowCount
        const rows: string[][] = Array.from({ length: rowCount }, () => Array(headerNames.length).fill(""))
        currentDataset.headers.forEach((h, idx) => {
          ;(h as any).data?.forEach((cell: any, rowIdx: number) => {
            if (rows[rowIdx]) rows[rowIdx][idx] = String(cell ?? "")
          })
        })
        twoD = [headerNames, ...rows]
      }
      setFormData({
        name: currentDataset.name || "",
        description: currentDataset.description || "",
        data: twoD,
      })
    }
  }, [currentDataset])

  // Handle input changes
  const handleInputChange = useCallback((field: keyof Omit<EditFormData, "data">, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setFormChanged(true)
  }, [])

  // Handle data changes from spreadsheet editor
  const handleDataChange = useCallback((newData: string[][]) => {
    setFormData((prev) => ({ ...prev, data: newData }))
    setDataChanged(true)
  }, [])

  // Handle save
  const handleSave = useCallback(async () => {
    if (!extractedId) return

    if (!formData.name.trim()) {
      showError(t("dataset_validationError", "Validation Error"), t("dataset_nameRequired", "Dataset name is required"))
      return
    }

    try {
      const updateData: any = {}

      // Only include changed fields
      if (formChanged) {
        if (formData.name !== currentDataset?.name) {
          updateData.name = formData.name.trim()
        }
        if (formData.description !== currentDataset?.description) {
          updateData.description = formData.description || null
        }
      }

      if (dataChanged) {
        // Convert 2D data back to headers format expected by API
        if (formData.data.length > 0) {
          const headerRow = formData.data[0]
          const bodyRows = formData.data.slice(1)
          updateData.headers = headerRow.map((name, idx) => ({
            name: name || `Column ${idx + 1}`,
            type: "string",
            index: idx,
            data: bodyRows.map((r) => r[idx] ?? ""),
          }))
        }
      }

      // If nothing changed, show a message
      if (Object.keys(updateData).length === 0) {
        showError(
          t("dataset_noChanges", "No Changes"),
          t("dataset_noChangesMessage", "No changes were made to the dataset"),
        )
        return
      }

      await updateDataset(extractedId, updateData).unwrap()

      showSuccess(
        t("dataset_updateSuccess", "Dataset Updated"),
        t("dataset_updateSuccessMessage", "Dataset has been updated successfully"),
      )

      // Reset change flags
      setFormChanged(false)
      setDataChanged(false)

      // Navigate back to dataset detail page after a short delay
      setTimeout(() => {
        navigate(
          Routers.DATASET_DETAIL.replace(
            ":slug",
            slug ||
              `${formData.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "")
                .substring(0, 60)}-${extractedId}`,
          ),
          { replace: true },
        )
      }, 800)
    } catch (error: any) {
      console.error("Update error:", error)

      if (error.status === 409) {
        showError(
          t("dataset_nameExists", "Dataset Name Already Exists"),
          t(
            "dataset_nameExistsMessage",
            `A dataset with the name "${formData.name.trim()}" already exists. Please choose a different name.`,
          ),
        )
      } else if (error.status === 404) {
        showError(
          t("dataset_notFound", "Dataset Not Found"),
          t("dataset_notFoundMessage", "The dataset you are trying to edit was not found"),
        )
      } else if (error.status === 403) {
        showError(
          t("dataset_accessDenied", "Access Denied"),
          t("dataset_accessDeniedMessage", "You do not have permission to edit this dataset"),
        )
      } else {
        showError(
          t("dataset_updateFailed", "Update Failed"),
          error.message || t("dataset_updateFailedMessage", "Failed to update dataset. Please try again."),
        )
      }
    }
  }, [
    extractedId,
    formData,
    currentDataset,
    formChanged,
    dataChanged,
    updateDataset,
    showSuccess,
    showError,
    t,
    navigate,
  ])

  // Handle cancel/back
  const handleBack = useCallback(() => {
    const backTarget = location?.state?.from || Routers.WORKSPACE_DATASETS
    if (formChanged || dataChanged) {
      if (window.confirm(t("dataset_unsavedChanges", "You have unsaved changes. Are you sure you want to leave?"))) {
        navigate(backTarget)
      }
    } else {
      navigate(backTarget)
    }
  }, [formChanged, dataChanged, navigate, t, location?.state?.from])

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <SlideInUp delay={0.2}>
          <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl p-8 text-center max-w-md">
            <CardHeader>
              <CardTitle className="text-red-600 dark:text-red-400">
                {t("dataset_loadError", "Error Loading Dataset")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {error || t("dataset_loadErrorMessage", "Failed to load dataset information")}
              </p>
              <Button
                onClick={() => navigate(Routers.DATASETS)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg"
              >
                {t("dataset_backToDetail", "Back to Dataset Detail")}
              </Button>
            </CardContent>
          </Card>
        </SlideInUp>
      </div>
    )
  }

  if (!currentDataset) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <SlideInUp delay={0.2}>
          <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl p-8 text-center max-w-md">
            <CardHeader>
              <CardTitle className="text-gray-600 dark:text-gray-400">
                {t("dataset_notFound", "Dataset Not Found")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t("dataset_notFoundMessage", "The dataset you are looking for was not found")}
              </p>
              <Button
                onClick={() => navigate(Routers.DATASETS)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg"
              >
                {t("dataset_backToDetail", "Back to Dataset Detail")}
              </Button>
            </CardContent>
          </Card>
        </SlideInUp>
      </div>
    )
  }

  const hasChanges = formChanged || dataChanged

  // Derive header/body rows for editor & stats (first row is headers)
  const headerRow = formData.data[0] || []
  const bodyRows = formData.data.length > 1 ? formData.data.slice(1) : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-6 items-start">
              {/* Left Sidebar: Info & Stats */}
              <div className="w-80 shrink-0 space-y-6">
                <SlideInUp delay={0.1}>
                  <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileSpreadsheet className="w-6 h-6 text-blue-600" />
                        {t("dataset_editTitle", "Edit Dataset")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="text-gray-600 dark:text-gray-400 text-sm">
                        {t("dataset_editDescription", "Modify dataset information and data")}
                      </div>
                    </CardContent>
                  </Card>
                </SlideInUp>

                <SlideInUp delay={0.15}>
                  <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-foreground flex items-center justify-between">
                        <span>{t("dataset_information", "Dataset Information")}</span>
                        {hasChanges && (
                          <span className="text-sm text-orange-600 dark:text-orange-400 font-normal">
                            {t("dataset_unsavedChangesIndicator", "Unsaved changes")}
                          </span>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                        >
                          {t("dataset_name", "Dataset Name")} *
                        </label>
                        <Input
                          id="name"
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          placeholder={t("dataset_namePlaceholder", "Enter dataset name")}
                          className="w-full"
                          disabled={updating}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="description"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                        >
                          {t("dataset_description", "Description")}
                        </label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                            handleInputChange("description", e.target.value)
                          }
                          placeholder={t("dataset_descriptionPlaceholder", "Enter dataset description")}
                          className="w-full resize-none"
                          rows={3}
                          disabled={updating}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </SlideInUp>

                <SlideInUp delay={0.2}>
                  <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-foreground">
                        {t("dataset_statistics", "Dataset Statistics")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{bodyRows.length}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{t("dataset_rows", "Rows")}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {headerRow.length}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {t("dataset_columns", "Columns")}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </SlideInUp>

                <SlideInUp delay={0.25}>
                  <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl">
                    <CardContent className="pt-6 space-y-3">
                      <Button
                        onClick={handleSave}
                        disabled={!hasChanges || updating}
                        className="w-full flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {updating ? t("dataset_saving", "Saving...") : t("dataset_save", "Save Changes")}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleBack}
                        className="w-full flex items-center gap-2 backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        {t("common_back", "Back")}
                      </Button>
                    </CardContent>
                  </Card>
                </SlideInUp>
              </div>

              {/* Main Content */}
              <div className="flex-1 max-w-5xl space-y-6">
                <SlideInUp delay={0.3}>
                  <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-foreground">
                        {t("dataset_dataEditor", "Data Editor")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CustomExcel
                        initialData={bodyRows}
                        initialColumns={headerRow.map((name) => ({ name, type: "string" as const }))}
                        onDataChange={(rows, cols) => {
                          const newHeader = cols.map((c) => c.name)
                          const new2D = [newHeader, ...rows]
                          handleDataChange(new2D)
                        }}
                        mode={updating ? "view" : "edit"}
                      />
                    </CardContent>
                  </Card>
                </SlideInUp>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EditDatasetPage
