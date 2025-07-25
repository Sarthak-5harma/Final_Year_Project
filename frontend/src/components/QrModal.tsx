import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { QRCodeCanvas } from 'qrcode.react';

const QrModal: React.FC<{ url: string; onClose: () => void }> = ({ url, onClose }) => (
  <Dialog open onOpenChange={onClose}>
    <DialogContent className="max-w-xs">
      <DialogHeader>
        <DialogTitle className="text-center">Scan QR</DialogTitle>
      </DialogHeader>
      <div className="flex flex-col items-center gap-2 py-2">
        <QRCodeCanvas value={url} size={220} />
        <p className="break-all text-xs text-center">{url}</p>
      </div>
    </DialogContent>
  </Dialog>
);

export default QrModal;