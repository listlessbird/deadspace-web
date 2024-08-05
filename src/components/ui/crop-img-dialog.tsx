import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useCallback, useRef } from "react"
import { ReactCropperElement, Cropper } from "react-cropper"

import "cropperjs/dist/cropper.css"

export function CropImgDialog({
  src,
  aspectRatio,
  onCropped,
  onClose,
}: {
  src: string
  aspectRatio: number
  onCropped: (blob: Blob | null) => void
  onClose: () => void
}) {
  const cropperRef = useRef<ReactCropperElement>(null)

  const crop = useCallback(() => {
    const cropper = cropperRef.current?.cropper
    if (!cropper) return
    cropper.getCroppedCanvas().toBlob((blob) => onCropped(blob), "image/webp")
    onClose()
  }, [onCropped, onClose])

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crop Image</DialogTitle>
        </DialogHeader>
        <Cropper
          src={src}
          aspectRatio={aspectRatio}
          guides
          zoomable
          ref={cropperRef}
          className="mx-auto size-full"
        />
        <DialogFooter>
          <Button variant={"secondary"} onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={crop}>Finish Crop</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
