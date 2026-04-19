import React, { useState, useEffect } from 'react';
import { 
  Folder, File, FileText, FileSpreadsheet, FileArchive, Video, Image as ImageIcon, 
  Plus, MoreVertical, Search, ChevronRight, Trash2, Download, ExternalLink,
  FolderPlus, Filter, Archive, Upload, X, Loader2, ArrowUpDown, ArrowUp, ArrowDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/useAuth';
import { 
  collection, query, where, onSnapshot, addDoc, deleteDoc, doc, 
  serverTimestamp, orderBy, writeBatch, getDocs 
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase';

interface NetworkFile {
  id: string;
  name: string;
  type: string;
  size: number;
  content?: string; // Base64 for small files
  url?: string; // For external links or large files
  folderId: string | null;
  ownerId: string;
  createdAt: any;
  mimeType: string;
  isArchived?: boolean;
}

interface NetworkFolder {
  id: string;
  name: string;
  parentId: string | null;
  ownerId: string;
  createdAt: any;
  isArchived?: boolean;
}

type SortField = 'name' | 'date' | 'size';
type SortOrder = 'asc' | 'desc';

export default function Network() {
  const { user } = useAuth();
  const [files, setFiles] = useState<NetworkFile[]>([]);
  const [folders, setFolders] = useState<NetworkFolder[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [isDragging, setIsDragging] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    id: string;
    isFolder: boolean;
    type: 'archive' | 'delete';
  } | null>(null);
  const [newFolderName, setNewFolderName] = useState('');

  useEffect(() => {
    if (!user) return;

    // Subscribe to folders
    const foldersQuery = query(
      collection(db, 'folders'),
      where('ownerId', '==', user.uid),
      where('isArchived', '!=', true),
      orderBy('isArchived'),
      orderBy('createdAt', 'desc')
    );
    const unsubFolders = onSnapshot(foldersQuery, (snapshot) => {
      setFolders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NetworkFolder)));
    });

    // Subscribe to files
    const filesQuery = query(
      collection(db, 'network_files'),
      where('ownerId', '==', user.uid),
      where('isArchived', '!=', true),
      orderBy('isArchived'),
      orderBy('createdAt', 'desc')
    );
    const unsubFiles = onSnapshot(filesQuery, (snapshot) => {
      setFiles(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NetworkFile)));
    });

    return () => {
      unsubFolders();
      unsubFiles();
    };
  }, [user]);

  const uploadFileToStorage = (file: File, folderId: string | null): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!user) return reject('No user');

      const storageRef = ref(storage, `network/${user.uid}/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));

      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(prev => ({ ...prev, [file.name]: progress }));
        }, 
        (error) => {
          console.error('Upload error:', error);
          reject(error);
        }, 
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          await addDoc(collection(db, 'network_files'), {
            name: file.name,
            type: getFileType(file.name),
            size: file.size,
            url: downloadURL,
            folderId,
            ownerId: user.uid,
            createdAt: serverTimestamp(),
            mimeType: file.type
          });
          setUploadProgress(prev => {
            const next = { ...prev };
            delete next[file.name];
            return next;
          });
          resolve();
        }
      );
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0 || !user) return;

    setIsUploading(true);
    try {
      await Promise.all(files.map(file => uploadFileToStorage(file, currentFolderId)));
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFolderUpload = async (e: any) => {
    const files = Array.from(e.target.files || []) as any[];
    if (files.length === 0 || !user) return;

    setIsUploading(true);
    try {
      // Group files by their relative path to reconstruct folder structure
      const folderMap = new Map<string, string>(); // path -> folderId

      for (const file of files) {
        const pathParts = file.webkitRelativePath.split('/');
        pathParts.pop(); // remove file name

        let parentId = currentFolderId;
        let currentPath = '';

        for (const part of pathParts) {
          currentPath = currentPath ? `${currentPath}/${part}` : part;
          
          if (folderMap.has(currentPath)) {
            parentId = folderMap.get(currentPath)!;
          } else {
            // Check if folder already exists in this parent
            const q = query(
              collection(db, 'folders'),
              where('ownerId', '==', user.uid),
              where('parentId', '==', parentId),
              where('name', '==', part),
              where('isArchived', '!=', true)
            );
            const snapshot = await getDocs(q);
            
            if (!snapshot.empty) {
              parentId = snapshot.docs[0].id;
            } else {
              // Create new folder
              const docRef = await addDoc(collection(db, 'folders'), {
                name: part,
                parentId,
                ownerId: user.uid,
                createdAt: serverTimestamp()
              });
              parentId = docRef.id;
            }
            folderMap.set(currentPath, parentId);
          }
        }
        
        await uploadFileToStorage(file, parentId);
      }
    } catch (error) {
      console.error('Folder upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragging(true);
  };

  const onDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev + 1);
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newCounter = dragCounter - 1;
    setDragCounter(newCounter);
    if (newCounter <= 0) {
      setIsDragging(false);
    }
  };

  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setDragCounter(0);
    
    const items = e.dataTransfer.items;
    if (!items || !user) return;

    setIsUploading(true);
    try {
      const entries: any[] = [];
      for (let i = 0; i < items.length; i++) {
        const entry = items[i].webkitGetAsEntry();
        if (entry) {
          entries.push(entry);
        }
      }

      for (const entry of entries) {
        await traverseEntry(entry, currentFolderId);
      }
    } catch (error) {
      console.error('Drop error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const traverseEntry = async (entry: any, parentId: string | null): Promise<void> => {
    if (entry.isFile) {
      return new Promise((resolve, reject) => {
        entry.file(async (file: File) => {
          try {
            await uploadFileToStorage(file, parentId);
            resolve();
          } catch (err) {
            reject(err);
          }
        });
      });
    } else if (entry.isDirectory) {
      // Create folder
      const docRef = await addDoc(collection(db, 'folders'), {
        name: entry.name,
        parentId,
        ownerId: user!.uid,
        createdAt: serverTimestamp()
      });
      const newFolderId = docRef.id;

      const reader = entry.createReader();
      const readAllEntries = async (): Promise<any[]> => {
        let allEntries: any[] = [];
        let entries = await new Promise<any[]>((resolve) => reader.readEntries(resolve));
        while (entries.length > 0) {
          allEntries = allEntries.concat(entries);
          entries = await new Promise<any[]>((resolve) => reader.readEntries(resolve));
        }
        return allEntries;
      };

      const entries = await readAllEntries();
      await Promise.all(entries.map(e => traverseEntry(e, newFolderId)));
    }
  };

  const createFolder = async () => {
    if (!newFolderName.trim() || !user) return;
    try {
      await addDoc(collection(db, 'folders'), {
        name: newFolderName,
        parentId: currentFolderId,
        ownerId: user.uid,
        createdAt: serverTimestamp()
      });
      setNewFolderName('');
      setShowFolderModal(false);
    } catch (error) {
      console.error('Create folder error:', error);
    }
  };

  const executeConfirmAction = async () => {
    if (!confirmAction) return;
    const { id, isFolder, type } = confirmAction;

    try {
      if (type === 'archive') {
        const batch = writeBatch(db);
        const ref = doc(db, isFolder ? 'folders' : 'network_files', id);
        batch.update(ref, { isArchived: true });
        await batch.commit();
      } else {
        await deleteDoc(doc(db, isFolder ? 'folders' : 'network_files', id));
      }
    } catch (error) {
      console.error(`${type} error:`, error);
    } finally {
      setConfirmAction(null);
    }
  };

  const archiveItem = (id: string, isFolder: boolean) => {
    setConfirmAction({ id, isFolder, type: 'archive' });
  };

  const deleteItem = (id: string, isFolder: boolean) => {
    setConfirmAction({ id, isFolder, type: 'delete' });
  };

  const getFileType = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext!)) return 'image';
    if (['mp4', 'mov', 'avi', 'webm'].includes(ext!)) return 'video';
    if (['pdf', 'doc', 'docx', 'txt'].includes(ext!)) return 'document';
    if (['xls', 'xlsx', 'csv'].includes(ext!)) return 'spreadsheet';
    if (['zip', 'rar', '7z'].includes(ext!)) return 'archive';
    return 'file';
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <ImageIcon size={20} className="text-white" />;
      case 'video': return <Video size={20} className="text-white" />;
      case 'document': return <FileText size={20} className="text-white" />;
      case 'spreadsheet': return <FileSpreadsheet size={20} className="text-white" />;
      case 'archive': return <FileArchive size={20} className="text-white" />;
      default: return <File size={20} className="text-gray-500" />;
    }
  };

  const sortItems = <T extends NetworkFile | NetworkFolder>(items: T[]): T[] => {
    return [...items].sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'date') {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        comparison = dateA - dateB;
      } else if (sortBy === 'size') {
        const sizeA = (a as NetworkFile).size || 0;
        const sizeB = (b as NetworkFile).size || 0;
        comparison = sizeA - sizeB;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  };

  const filteredFiles = files.filter(f => f.folderId === currentFolderId && f.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredFolders = folders.filter(f => f.parentId === currentFolderId && f.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const currentFiles = sortItems(filteredFiles);
  const currentFolders = sortItems(filteredFolders);

  const breadcrumbs = [];
  let tempFolderId = currentFolderId;
  while (tempFolderId) {
    const folder = folders.find(f => f.id === tempFolderId);
    if (folder) {
      breadcrumbs.unshift(folder);
      tempFolderId = folder.parentId;
    } else {
      break;
    }
  }

  return (
    <div 
      className={`h-full bg-[var(--color-bg)] text-[var(--color-text)] flex flex-col p-4 sm:p-14 transition-all relative overflow-hidden no-scrollbar ${isDragging ? 'opacity-50' : ''}`}
      onDragOver={onDragOver}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {/* Drag & Drop Overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-[var(--color-bg)]/80 backdrop-blur-xl border-4 border-dashed border-[var(--color-accent)] flex flex-col items-center justify-center pointer-events-none"
          >
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[1.5rem] sm:rounded-[2rem] neu-convex flex items-center justify-center mb-6 shadow-2xl">
              <Upload size={40} className="sm:w-12 sm:h-12 text-[var(--color-accent)] animate-bounce" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--color-text)] uppercase px-6 text-center">Relinquish Assets</h2>
            <p className="text-[var(--color-text)] opacity-40 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] mt-4">Protocol: Secure Batch Transmission</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 sm:mb-12 gap-6 sm:gap-8">
        <div className="text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--color-text)] uppercase">Vault</h1>
          <p className="text-[var(--color-text)] opacity-40 text-base sm:text-lg font-medium tracking-tight mt-0.5 sm:mt-1 px-4 sm:px-0">Strategic assets and collective intelligence.</p>
        </div>
        <div className="flex gap-4 sm:gap-5">
          <button 
            onClick={() => setShowFolderModal(true)}
            className="p-4 sm:p-5 neu-button rounded-xl sm:rounded-2xl text-[var(--color-text)] opacity-60 hover:opacity-100 hover:text-[var(--color-accent)] transition-all"
            title="New Collection"
          >
            <FolderPlus size={20} className="sm:w-6 sm:h-6" strokeWidth={2.5} />
          </button>
          
          <div className="relative group">
            <button className="h-14 sm:h-16 px-6 sm:px-10 neu-button-accent text-white rounded-xl sm:rounded-2xl transition-all flex items-center gap-3 font-black text-[9px] sm:text-[10px] uppercase tracking-[0.2em] shadow-lg">
              <Plus size={18} className="sm:w-5 sm:h-5" strokeWidth={3} />
              {isUploading ? 'Syncing...' : 'Provision'}
            </button>
            
            <div className="absolute right-0 mt-3 sm:mt-5 w-56 sm:w-64 neu-convex rounded-2xl sm:rounded-[2.5rem] shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden py-2 sm:py-3">
              <label className="flex items-center gap-3 sm:gap-4 px-6 sm:px-8 py-4 sm:py-5 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[var(--color-text)] opacity-60 hover:opacity-100 hover:neu-concave cursor-pointer transition-all">
                <File size={16} className="sm:w-[18px] sm:h-[18px] text-[var(--color-accent)]" />
                Atomic Assets
                <input type="file" className="hidden" onChange={handleFileUpload} multiple disabled={isUploading} />
              </label>
              <label className="flex items-center gap-3 sm:gap-4 px-6 sm:px-8 py-4 sm:py-5 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[var(--color-text)] opacity-60 hover:opacity-100 hover:neu-concave cursor-pointer transition-all border-t border-[var(--color-shadow-dark)]/5">
                <Folder size={16} className="sm:w-[18px] sm:h-[18px] text-[var(--color-accent)]" />
                Linked Nodes
                <input 
                  type="file" 
                  className="hidden" 
                  onChange={handleFolderUpload} 
                  disabled={isUploading} 
                  {...({ webkitdirectory: "", directory: "" } as any)} 
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 sm:gap-4 mb-8 sm:mb-10 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] flex-wrap justify-center sm:justify-start">
        <button 
          onClick={() => setCurrentFolderId(null)}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl transition-all ${!currentFolderId ? 'neu-concave text-[var(--color-accent)]' : 'text-[var(--color-text)] opacity-20 hover:opacity-60'}`}
        >
          Root
        </button>
        {breadcrumbs.map((folder) => (
          <React.Fragment key={folder.id}>
            <ChevronRight size={12} className="text-[var(--color-text)] opacity-10" strokeWidth={3} />
            <button 
              onClick={() => setCurrentFolderId(folder.id)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl transition-all ${currentFolderId === folder.id ? 'neu-concave text-[var(--color-accent)]' : 'text-[var(--color-text)] opacity-20 hover:opacity-60'}`}
            >
              {folder.name}
            </button>
          </React.Fragment>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 mb-8 sm:mb-12">
        <div className="flex-1 relative neu-concave rounded-2xl sm:rounded-3xl p-1 flex items-center">
          <Search className="ml-4 sm:ml-6 text-[var(--color-text)] opacity-20 sm:w-5 sm:h-5" size={18} strokeWidth={2.5} />
          <input 
            type="text" 
            placeholder="Search Vault..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none py-4 sm:py-5 px-4 sm:px-6 text-sm sm:text-base text-[var(--color-text)] outline-none placeholder-[var(--color-text)] placeholder:opacity-20 font-medium"
          />
        </div>
        
        <div className="flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          <div className="flex neu-concave rounded-xl sm:rounded-[1.5rem] p-0.5 sm:p-1 overflow-hidden shrink-0">
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortField)}
              className="bg-transparent text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-[var(--color-text)] opacity-40 px-4 sm:px-6 py-2 outline-none cursor-pointer hover:opacity-100 transition-all"
            >
              <option value="name">Alpha</option>
              <option value="date">Temporal</option>
              <option value="size">Magnitude</option>
            </select>
            <button 
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="px-4 sm:px-6 text-[var(--color-text)] opacity-20 hover:opacity-100 transition-all flex items-center justify-center bg-transparent border-l border-[var(--color-shadow-dark)]/10"
            >
              {sortOrder === 'asc' ? <ArrowUp size={14} className="sm:w-4 sm:h-4" strokeWidth={3} /> : <ArrowDown size={14} className="sm:w-4 sm:h-4" strokeWidth={3} />}
            </button>
          </div>

          <button className="px-6 sm:px-8 py-3 sm:py-0 neu-button rounded-xl sm:rounded-[1.5rem] text-[var(--color-text)] opacity-40 hover:opacity-100 transition-all flex items-center gap-2 sm:gap-3 text-[8px] sm:text-[10px] font-black uppercase tracking-widest shrink-0">
            <Filter size={16} className="sm:w-[18px] sm:h-[18px]" strokeWidth={2.5} />
            Refine
          </button>
        </div>
      </div>

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="mb-8 sm:mb-12 space-y-3 sm:space-y-4">
          {Object.entries(uploadProgress).map(([name, progress]) => (
            <div key={name} className="neu-convex rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex items-center gap-4 sm:gap-6 shadow-sm">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl neu-concave flex items-center justify-center text-[var(--color-accent)]">
                <Loader2 size={20} className="sm:w-6 sm:h-6 animate-spin" strokeWidth={3} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between mb-2 sm:mb-3">
                  <span className="text-xs sm:text-sm font-black text-[var(--color-text)] truncate max-w-[200px] sm:max-w-[300px] uppercase tracking-wider">{name}</span>
                  <span className="text-[8px] sm:text-[10px] font-black text-[var(--color-accent)] italic tracking-widest">{Math.round(progress)}%</span>
                </div>
                <div className="h-1.5 sm:h-2 neu-concave rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-[var(--color-accent)] shadow-[0_0_10px_var(--color-accent)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grid View */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 sm:gap-8">
          {/* Folders */}
          {currentFolders.map((folder) => (
            <motion.div 
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              key={folder.id}
              onDoubleClick={() => setCurrentFolderId(folder.id)}
              onClick={() => { if (window.innerWidth < 768) setCurrentFolderId(folder.id) }}
              className="group p-6 sm:p-8 neu-convex rounded-[2.5rem] sm:rounded-[3rem] hover:scale-[1.02] transition-all cursor-pointer relative"
            >
              <div className="flex items-center justify-between mb-6 sm:mb-8">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-[1.5rem] neu-concave flex items-center justify-center text-[var(--color-accent)]">
                  <Folder size={24} className="sm:w-9 sm:h-9" fill="currentColor" fillOpacity={0.15} strokeWidth={2} />
                </div>
                <div className="flex gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-all sm:translate-x-2 sm:group-hover:translate-x-0">
                  <button 
                    onClick={(e) => { e.stopPropagation(); archiveItem(folder.id, true); }}
                    className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl neu-button text-[var(--color-text)] opacity-40 hover:opacity-100 hover:text-[#FF9500] transition-all"
                  >
                    <Archive size={16} className="sm:w-[18px] sm:h-[18px]" strokeWidth={2.5} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteItem(folder.id, true); }}
                    className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl neu-button text-[var(--color-text)] opacity-40 hover:opacity-100 hover:text-[#FF3B30] transition-all"
                  >
                    <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" strokeWidth={2.5} />
                  </button>
                </div>
              </div>
              <h3 className="font-extrabold text-base sm:text-lg text-[var(--color-text)] truncate mb-1.5 sm:mb-2">{folder.name}</h3>
              <p className="text-[9px] sm:text-[10px] font-black text-[var(--color-text)] opacity-20 uppercase tracking-[0.3em]">Module Collection</p>
            </motion.div>
          ))}

          {/* Files */}
          {currentFiles.map((file) => (
            <motion.div 
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              key={file.id}
              className="group p-6 sm:p-8 neu-convex rounded-[2.5rem] sm:rounded-[3rem] hover:scale-[1.02] transition-all relative"
            >
              <div className="flex items-center justify-between mb-6 sm:mb-8">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-[1.5rem] neu-concave flex items-center justify-center text-[var(--color-text)] opacity-20">
                  {getFileIcon(file.type)}
                </div>
                <div className="flex gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-all sm:translate-x-2 sm:group-hover:translate-x-0">
                  <a 
                    href={file.url || file.content} 
                    target="_blank"
                    rel="noopener noreferrer"
                    download={file.name}
                    className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl neu-button text-[var(--color-text)] opacity-40 hover:opacity-100 hover:text-[#34C759] transition-all"
                  >
                    <Download size={16} className="sm:w-[18px] sm:h-[18px]" strokeWidth={2.5} />
                  </a>
                  <button 
                    onClick={() => archiveItem(file.id, false)}
                    className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl neu-button text-[var(--color-text)] opacity-40 hover:opacity-100 hover:text-[#FF9500] transition-all"
                  >
                    <Archive size={16} className="sm:w-[18px] sm:h-[18px]" strokeWidth={2.5} />
                  </button>
                  <button 
                    onClick={() => deleteItem(file.id, false)}
                    className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl neu-button text-[var(--color-text)] opacity-40 hover:opacity-100 hover:text-[#FF3B30] transition-all"
                  >
                    <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" strokeWidth={2.5} />
                  </button>
                </div>
              </div>
              <h3 className="font-extrabold text-base sm:text-lg text-[var(--color-text)] truncate mb-1.5 sm:mb-2">{file.name}</h3>
              <div className="flex items-center justify-between">
                <p className="text-[8px] sm:text-[9px] font-black text-[var(--color-text)] opacity-20 uppercase tracking-[0.2em]">{(file.size / 1024).toFixed(1)} KB</p>
                <div className="neu-concave px-2 sm:px-3 py-1 rounded-full">
                  <span className="text-[7px] sm:text-[8px] font-black text-[var(--color-accent)] uppercase tracking-widest">{file.type}</span>
                </div>
              </div>
            </motion.div>
          ))}

          {currentFiles.length === 0 && currentFolders.length === 0 && (
            <div className="col-span-full py-24 sm:py-48 text-center neu-concave rounded-[3rem] sm:rounded-[4rem] space-y-8 sm:space-y-10 px-6">
              <div className="w-20 h-20 sm:w-24 sm:h-24 neu-convex rounded-full flex items-center justify-center mx-auto text-[var(--color-text)] opacity-10">
                <Folder size={32} className="sm:w-10 sm:h-10" strokeWidth={1} />
              </div>
              <div className="space-y-2 sm:space-y-3">
                <h4 className="text-[var(--color-text)] opacity-40 text-xl sm:text-2xl font-black tracking-tight uppercase px-4 text-center">Void Directory</h4>
                <p className="text-[var(--color-text)] opacity-20 text-sm sm:text-base font-medium italic">Provision assets to establish this collection.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Folder Modal */}
      <AnimatePresence>
        {showFolderModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[var(--color-bg)]/80 backdrop-blur-2xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="w-full max-w-md neu-convex rounded-[2.5rem] sm:rounded-[3.5rem] p-8 sm:p-12 shadow-2xl space-y-8 sm:space-y-10"
            >
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--color-text)] uppercase leading-none">Initialize</h2>
                <p className="text-[var(--color-text)] opacity-40 text-sm font-medium">Define a new collection parameters.</p>
              </div>
              <div className="space-y-8 sm:space-y-10">
                <div className="neu-concave rounded-2xl sm:rounded-3xl p-1 sm:p-2">
                  <input 
                    type="text" 
                    placeholder="Collection Label"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    autoFocus
                    className="w-full bg-transparent border-none rounded-xl sm:rounded-2xl py-4 sm:py-5 px-5 sm:px-6 text-sm sm:text-base text-[var(--color-text)] outline-none placeholder-[var(--color-text)] placeholder:opacity-20 font-bold"
                  />
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setShowFolderModal(false)}
                    className="flex-1 py-4 sm:py-5 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text)] opacity-40 hover:opacity-100 transition-all hover:neu-button"
                  >
                    Abort
                  </button>
                  <button 
                    onClick={createFolder}
                    className="flex-1 py-4 sm:py-5 neu-button-accent text-white rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmAction && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-[var(--color-bg)]/90 backdrop-blur-3xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="w-full max-w-md neu-convex rounded-[3rem] sm:rounded-[4rem] p-10 sm:p-14 text-center space-y-8 sm:space-y-10"
            >
              <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto shadow-inner neu-concave ${
                confirmAction.type === 'delete' ? 'text-[#FF3B30]' : 'text-[#FF9500]'
              }`}>
                {confirmAction.type === 'delete' ? <Trash2 size={36} className="sm:w-[44px] sm:h-[44px]" strokeWidth={2.5} /> : <Archive size={36} className="sm:w-[44px] sm:h-[44px]" strokeWidth={2.5} />}
              </div>
              <div className="space-y-2 sm:space-y-3">
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--color-text)] uppercase leading-none">
                  {confirmAction.type === 'delete' ? 'Delete' : 'Archive'}
                </h2>
                <p className="text-[var(--color-text)] opacity-40 text-sm sm:text-base font-medium italic">
                  Confirmed {confirmAction.isFolder ? 'Collection' : 'Asset'} targeting.
                </p>
              </div>
              <p className="text-[var(--color-text)] opacity-60 text-xs sm:text-sm leading-relaxed px-2 sm:px-4">
                {confirmAction.type === 'delete' 
                  ? 'Strategic purge initiated. Digital presence will be permanently dissolved.' 
                  : 'Asset relocation proposed. Transferring to cold storage archives.'}
              </p>
              <div className="flex gap-4 sm:gap-5 pt-2 sm:pt-4">
                <button 
                  onClick={() => setConfirmAction(null)}
                  className="flex-1 py-4 sm:py-5 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text)] opacity-40 hover:opacity-100 transition-all"
                >
                  Recall
                </button>
                <button 
                  onClick={executeConfirmAction}
                  className={`flex-1 py-4 sm:py-5 text-white rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] shadow-lg transition-all active:scale-95 ${
                    confirmAction.type === 'delete' ? 'bg-[#FF3B30] hover:bg-[#FF453A] shadow-[#FF3B3030]' : 'bg-[#FF9500] hover:bg-[#FFAC33] shadow-[#FF950030]'
                  }`}
                >
                  Execute
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
