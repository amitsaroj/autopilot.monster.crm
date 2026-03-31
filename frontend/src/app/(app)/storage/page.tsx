import { Upload, Folder, File, Trash2, Download, FolderPlus } from 'lucide-react';


const files = [
  { name: 'Q3 Sales Report.pdf', type: 'PDF', size: '2.4 MB', modified: '2h ago', folder: false },
  { name: 'Contracts', type: 'folder', size: '24 files', modified: '1d ago', folder: true },
  { name: 'Product Images', type: 'folder', size: '148 files', modified: '3d ago', folder: true },
  { name: 'GlobalInc-Contract.docx', type: 'DOC', size: '840 KB', modified: '4d ago', folder: false },
  { name: 'Pitch Deck 2026.pptx', type: 'PPT', size: '8.1 MB', modified: '1w ago', folder: false },
];

export default function StoragePage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Storage</h1>
          <p className="page-description">4.2 GB used of 50 GB · MinIO object storage</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors">
            <FolderPlus className="h-4 w-4" /> New Folder
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[hsl(246,80%,60%)] hover:bg-[hsl(246,80%,55%)] text-white rounded-lg text-sm font-medium transition-colors">
            <Upload className="h-4 w-4" /> Upload File
          </button>
        </div>
      </div>
      {/* Usage bar */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Storage Usage</span>
          <span className="text-sm text-muted-foreground">4.2 GB / 50 GB</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-[hsl(246,80%,60%)] rounded-full" style={{ width: '8.4%' }} /></div>
        <p className="text-xs text-muted-foreground mt-2">8.4% used · 45.8 GB remaining</p>
      </div>
      {/* Files */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Home</span>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm font-medium">All Files</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground w-8"><input type="checkbox" /></th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Type</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Size</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Modified</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {files.map((f) => (
              <tr key={f.name} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3"><input type="checkbox" /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    {f.folder ? <Folder className="h-4 w-4 text-yellow-500" /> : <File className="h-4 w-4 text-muted-foreground" />}
                    <span className="font-medium text-foreground hover:text-[hsl(246,80%,60%)] cursor-pointer">{f.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{f.type}</td>
                <td className="px-4 py-3 text-muted-foreground">{f.size}</td>
                <td className="px-4 py-3 text-muted-foreground">{f.modified}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 justify-end">
                    <button className="p-1 rounded hover:bg-muted transition-colors"><Download className="h-3.5 w-3.5 text-muted-foreground" /></button>
                    <button className="p-1 rounded hover:bg-muted transition-colors"><Trash2 className="h-3.5 w-3.5 text-muted-foreground" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
