"use client"

import * as React from "react"
import { TwoLevelLayout } from "@/components/ui/two-level-layout"
import { Header } from "@/components/ui/header"
import { ModuleSettings } from "@/components/ui/module-settings"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { QrCode, BarChart3, Download, Settings } from "lucide-react"

export default function ProductsSettingsPage() {
  const [settings, setSettings] = React.useState([
    // Product Configuration
    {
      id: "auto_sku_generation",
      label: "Auto SKU Generation",
      description: "Automatically generate SKU codes for new products",
      type: "toggle" as const,
      value: true,
      category: "Product Configuration"
    },
    {
      id: "sku_format",
      label: "SKU Format",
      description: "Format pattern for SKU generation",
      type: "input" as const,
      value: "ART-{CATEGORY}-{SIZE}-{COLOR}",
      category: "Product Configuration"
    },
    {
      id: "require_all_variants",
      label: "Require All Variants",
      description: "Require size and color variants for all articles",
      type: "toggle" as const,
      value: false,
      category: "Product Configuration"
    },
    // Pricing
    {
      id: "dynamic_pricing_rules",
      label: "Dynamic Pricing Rules",
      description: "Enable automatic pricing rules based on cost",
      type: "toggle" as const,
      value: true,
      category: "Pricing"
    },
    {
      id: "markup_percentage",
      label: "Default Markup Percentage",
      description: "Default markup percentage for new products",
      type: "number" as const,
      value: 50,
      category: "Pricing"
    },
    // Quality Control
    {
      id: "quality_check_required",
      label: "Quality Check Required",
      description: "Require quality inspection for new products",
      type: "toggle" as const,
      value: true,
      category: "Quality Control"
    }
  ])

  // Barcode design state
  const [barcodeData, setBarcodeData] = React.useState("1234567890123")
  const [barcodeFormat, setBarcodeFormat] = React.useState("CODE128")
  const [qrData, setQrData] = React.useState("https://malaka-erp.com/product/1234")
  const [activeTab, setActiveTab] = React.useState("settings")

  // Handle URL parameters for pre-filled data
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const tab = urlParams.get('tab')
      const data = urlParams.get('data')
      
      if (tab === 'barcode') {
        setActiveTab('barcode')
        if (data) {
          const decodedData = decodeURIComponent(data)
          if (decodedData.startsWith('Product:')) {
            setQrData(decodedData)
          } else {
            setBarcodeData(decodedData)
          }
        }
      }
    }
  }, [])
  const [barcodeCanvas, setBarcodeCanvas] = React.useState<string | null>(null)
  const [qrCanvas, setQrCanvas] = React.useState<string | null>(null)
  const barcodeRef = React.useRef<HTMLCanvasElement>(null)
  const qrRef = React.useRef<HTMLCanvasElement>(null)

  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)

  const handleSettingChange = (settingId: string, value: any) => {
    setSettings(prev => prev.map(setting => 
      setting.id === settingId ? { ...setting, value } : setting
    ))
    setHasUnsavedChanges(true)
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setHasUnsavedChanges(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setHasUnsavedChanges(false)
  }

  // Generate barcode
  const generateBarcode = React.useCallback(async () => {
    if (!barcodeRef.current || typeof window === 'undefined') return
    
    try {
      const JsBarcode = (await import('jsbarcode')).default
      JsBarcode(barcodeRef.current, barcodeData, {
        format: barcodeFormat,
        width: 2,
        height: 100,
        displayValue: true,
        fontSize: 12,
        margin: 10
      })
      setBarcodeCanvas(barcodeRef.current.toDataURL())
    } catch (error) {
      console.error('Error generating barcode:', error)
    }
  }, [barcodeData, barcodeFormat])

  // Generate QR code
  const generateQRCode = React.useCallback(async () => {
    if (!qrRef.current || typeof window === 'undefined') return
    
    try {
      const QRCode = await import('qrcode')
      const url = await QRCode.toDataURL(qrData, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      setQrCanvas(url)
      
      // Draw to canvas for consistency
      const ctx = qrRef.current.getContext('2d')
      if (ctx) {
        const img = new Image()
        img.onload = () => {
          qrRef.current!.width = img.width
          qrRef.current!.height = img.height
          ctx.drawImage(img, 0, 0)
        }
        img.src = url
      }
    } catch (error) {
      console.error('Error generating QR code:', error)
    }
  }, [qrData])

  // Download barcode/QR code
  const downloadImage = (canvas: HTMLCanvasElement, filename: string) => {
    const link = document.createElement('a')
    link.download = filename
    link.href = canvas.toDataURL()
    link.click()
  }

  React.useEffect(() => {
    generateBarcode()
  }, [generateBarcode])

  React.useEffect(() => {
    generateQRCode()
  }, [generateQRCode])

  const breadcrumbs = [
    { label: "Products", href: "/products" },
    { label: "Settings" }
  ]

  return (
    <TwoLevelLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Products Settings" breadcrumbs={breadcrumbs} />
        <div className="flex-1 overflow-auto p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="inline-flex">
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                General Settings
              </TabsTrigger>
              <TabsTrigger value="barcode" className="flex items-center gap-2">
                <QrCode className="h-4 w-4" />
                Barcode Design
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="settings" className="mt-6">
              <ModuleSettings
                moduleName="Products"
                moduleId="products"
                settings={settings}
                onSettingChange={handleSettingChange}
                onSave={handleSave}
                onReset={handleReset}
                isLoading={isLoading}
                hasUnsavedChanges={hasUnsavedChanges}
              />
            </TabsContent>
            
            <TabsContent value="barcode" className="mt-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* UPC/Barcode Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Universal Product Code (UPC)
                    </CardTitle>
                    <CardDescription>
                      Generate and customize UPC barcodes for your products
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="barcode-data">Barcode Data</Label>
                      <Input
                        id="barcode-data"
                        value={barcodeData}
                        onChange={(e) => setBarcodeData(e.target.value)}
                        placeholder="Enter barcode data"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="barcode-format">Barcode Format</Label>
                      <Select value={barcodeFormat} onValueChange={setBarcodeFormat}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CODE128">CODE128</SelectItem>
                          <SelectItem value="CODE39">CODE39</SelectItem>
                          <SelectItem value="EAN13">EAN13</SelectItem>
                          <SelectItem value="EAN8">EAN8</SelectItem>
                          <SelectItem value="UPC">UPC</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex flex-col items-center space-y-4 p-4 border-2 border-dashed border-muted rounded-lg">
                      <canvas
                        ref={barcodeRef}
                        className="max-w-full h-auto"
                        style={{ display: 'none' }}
                      />
                      {barcodeCanvas && (
                        <img
                          src={barcodeCanvas}
                          alt="Generated barcode"
                          className="max-w-full h-auto border rounded"
                        />
                      )}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={generateBarcode}
                          className="flex items-center gap-2"
                        >
                          Generate
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => barcodeRef.current && downloadImage(barcodeRef.current, `barcode-${barcodeData}.png`)}
                          disabled={!barcodeCanvas}
                          className="flex items-center gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* QR Code Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <QrCode className="h-5 w-5" />
                      QR Code
                    </CardTitle>
                    <CardDescription>
                      Generate and customize QR codes for your products
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="qr-data">QR Code Data</Label>
                      <Input
                        id="qr-data"
                        value={qrData}
                        onChange={(e) => setQrData(e.target.value)}
                        placeholder="Enter URL or text data"
                      />
                    </div>
                    
                    <div className="flex flex-col items-center space-y-4 p-4 border-2 border-dashed border-muted rounded-lg">
                      <canvas
                        ref={qrRef}
                        className="max-w-full h-auto border rounded"
                        width={200}
                        height={200}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={generateQRCode}
                          className="flex items-center gap-2"
                        >
                          Generate
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => qrRef.current && downloadImage(qrRef.current, `qrcode-${Date.now()}.png`)}
                          disabled={!qrCanvas}
                          className="flex items-center gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Usage Examples */}
              <Card>
                <CardHeader>
                  <CardTitle>Usage Examples</CardTitle>
                  <CardDescription>
                    Common barcode and QR code use cases for products
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-medium mb-2">UPC/Barcode Uses:</h4>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>• Product identification</li>
                        <li>• Inventory tracking</li>
                        <li>• Point of sale systems</li>
                        <li>• Stock management</li>
                        <li>• Shipping labels</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">QR Code Uses:</h4>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>• Product information pages</li>
                        <li>• Customer reviews links</li>
                        <li>• Digital catalogs</li>
                        <li>• Marketing campaigns</li>
                        <li>• Authentication/verification</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </TwoLevelLayout>
  )
}