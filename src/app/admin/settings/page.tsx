'use client'

import { useState, useEffect } from 'react'
import { Save, Loader2, Settings2, Globe, Phone, List, Shield, Plus, Trash2 } from "lucide-react"
import { getSettingsAction, updateSettingsAction } from "@/actions/admin/settings.actions"
import { Setting } from "@/domain/entities/setting"
import { toast } from 'sonner'

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<Setting[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [unsavedChanges, setUnsavedChanges] = useState<Record<string, string>>({})
    const [activeTab, setActiveTab] = useState('general')

    const loadSettings = async () => {
        setLoading(true)
        const result = await getSettingsAction()
        if (result.success && result.data) {
            setSettings(result.data)
        } else {
            toast.error("فشل تحميل الإعدادات")
        }
        setLoading(false)
    }

    useEffect(() => {
        // Use a tick to avoid "setState in effect" warning
        setTimeout(() => loadSettings(), 0)
    }, [])

    const handleChange = (key: string, value: string) => {
        setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s))
        setUnsavedChanges(prev => ({ ...prev, [key]: value }))
    }

    const handleSave = async () => {
        if (Object.keys(unsavedChanges).length === 0) return

        setSaving(true)
        const result = await updateSettingsAction(unsavedChanges)

        if (result.success) {
            toast.success(result.message)
            setUnsavedChanges({})
        } else {
            toast.error(result.message || "فشل الحفظ")
        }
        setSaving(false)
    }

    // Helper to group settings
    const getGroup = (group: string) => settings.filter(s => s.group === group)

    if (loading) {
        return <div className="p-12 text-center text-slate-500 flex justify-center"><Loader2 className="animate-spin" /></div>
    }

    const tabs = [
        { id: 'general', label: 'عامة', icon: Globe },
        { id: 'contact', label: 'التواصل', icon: Phone },
        { id: 'menus', label: 'القوائم', icon: List },
        { id: 'system', label: 'النظام', icon: Shield },
    ]

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-900 border border-slate-800 p-6 rounded-2xl gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Settings2 className="text-primary" />
                        إعدادات الموقع
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">التحكم في بيانات الموقع، القوائم، والصيانة</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving || Object.keys(unsavedChanges).length === 0}
                    className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {saving ? <Loader2 className="animate-spin h-5 w-5" /> : <Save className="h-5 w-5" />}
                    حفظ التغييرات
                </button>
            </div>

            {/* Custom Tabs */}
            <div className="grid grid-cols-4 bg-slate-900 p-1 rounded-xl mb-6 border border-slate-800">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                            flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-colors
                            ${activeTab === tab.id
                                ? 'bg-slate-800 text-white shadow-sm'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}
                        `}
                    >
                        <tab.icon className="w-4 h-4" />
                        <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

                {/* General Tab */}
                {activeTab === 'general' && (
                    <div className="space-y-6">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-white">البيانات الأساسية</h2>
                            <p className="text-slate-400 text-sm">تظهر هذه البيانات في العناوين ومحركات البحث</p>
                        </div>
                        {getGroup('general').map(setting => (
                            <SettingInput key={setting.key} setting={setting} onChange={handleChange} />
                        ))}
                    </div>
                )}

                {/* Contact Tab */}
                {activeTab === 'contact' && (
                    <div className="space-y-6">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-white">معلومات الاتصال</h2>
                            <p className="text-slate-400 text-sm">تظهر في الفوتر وصفحة اتصل بنا</p>
                        </div>
                        {getGroup('contact').filter(s => s.type !== 'json').map(setting => (
                            <SettingInput key={setting.key} setting={setting} onChange={handleChange} />
                        ))}
                    </div>
                )}

                {/* Menus Tab */}
                {activeTab === 'menus' && (
                    <div className="space-y-8">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-white">بناء القوائم</h2>
                            <p className="text-slate-400 text-sm">التحكم في الروابط المعروضة في الفوتر</p>
                        </div>
                        {/* Special handling for JSON menus including Social Links which are technically 'contact' group but 'json' type */}
                        {getGroup('menus').concat(getGroup('contact').filter(s => s.type === 'json')).map(setting => (
                            <div key={setting.key} className="space-y-4 pt-6 border-t border-slate-800 first:border-0 first:pt-0">
                                <div>
                                    <label className="block text-white font-medium mb-1">{setting.label}</label>
                                    <p className="text-xs text-slate-500">{setting.description}</p>
                                </div>
                                <MenuBuilder
                                    initialValue={setting.value}
                                    onChange={(newJson) => handleChange(setting.key, newJson)}
                                />
                            </div>
                        ))}
                    </div>
                )}

                {/* System Tab */}
                {activeTab === 'system' && (
                    <div className="space-y-6">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-white">إعدادات النظام</h2>
                            <p className="text-slate-400 text-sm">خيارات متقدمة للتحكم في الموقع</p>
                        </div>
                        {getGroup('system').map(setting => (
                            <SettingInput key={setting.key} setting={setting} onChange={handleChange} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

// Sub-components with Raw HTML/Tailwind

function SettingInput({ setting, onChange }: { setting: Setting, onChange: (k: string, v: string) => void }) {
    if (setting.type === 'boolean') {
        const isChecked = setting.value === 'true';
        return (
            <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
                <div className="space-y-0.5">
                    <label className="text-base text-slate-200 font-medium">{setting.label}</label>
                    <p className="text-xs text-slate-500">{setting.description}</p>
                </div>
                {/* Custom Switch Toggle */}
                <button
                    onClick={() => onChange(setting.key, (!isChecked).toString())}
                    className={`w-11 h-6 rounded-full transition-colors relative ${isChecked ? 'bg-primary' : 'bg-slate-700'}`}
                >
                    <span className={`block w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${isChecked ? 'left-1' : 'right-1'}`} />
                </button>
            </div>
        )
    }

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">{setting.label}</label>
            {setting.key.includes('description') ? (
                <textarea
                    value={setting.value || ''}
                    onChange={(e) => onChange(setting.key, e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-primary transition-colors min-h-[100px]"
                />
            ) : (
                <input
                    type="text"
                    value={setting.value || ''}
                    onChange={(e) => onChange(setting.key, e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-primary transition-colors"
                    dir="auto"
                />
            )}
            <p className="text-xs text-slate-500">{setting.description}</p>
        </div>
    )
}

interface MenuItem {
    label?: string
    url?: string
    platform?: string
    [key: string]: unknown
}

function MenuBuilder({ initialValue, onChange }: { initialValue: string, onChange: (val: string) => void }) {
    const [items, setItems] = useState<MenuItem[]>(() => {
        try {
            const parsed = JSON.parse(initialValue || '[]')
            return Array.isArray(parsed) ? parsed : []
        } catch {
            return []
        }
    })

    useEffect(() => {
        if (!initialValue) return
        try {
            const parsed = JSON.parse(initialValue)
            const currentJson = JSON.stringify(items)
            if (JSON.stringify(parsed) !== currentJson) {
                // Use a tick to avoid synchronous setState warning
                setTimeout(() => {
                    setItems(Array.isArray(parsed) ? parsed : [])
                }, 0)
            }
        } catch {
            // ignore
        }
    }, [initialValue, items])

    const updateJson = (newItems: MenuItem[]) => {
        setItems(newItems)
        onChange(JSON.stringify(newItems))
    }

    const addItem = () => {
        updateJson([...items, { label: 'رابط جديد', url: '/' }])
    }

    const removeItem = (index: number) => {
        const newItems = [...items]
        newItems.splice(index, 1)
        updateJson(newItems)
    }

    const updateItem = (index: number, field: string, value: string) => {
        const newItems = [...items]
        newItems[index] = { ...newItems[index], [field]: value }
        updateJson(newItems)
    }

    return (
        <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 space-y-3">
            {items.map((item, idx) => (
                <div key={idx} className="flex flex-col md:flex-row gap-2 items-start bg-slate-900/50 p-3 rounded-lg border border-slate-800/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 flex-1 w-full">
                        <input
                            placeholder="النص (الاسم)"
                            value={item.label || item.platform || ''}
                            onChange={(e) => updateItem(idx, item.label ? 'label' : 'platform', e.target.value)}
                            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-primary/50"
                        />
                        <input
                            placeholder="الرابط (URL)"
                            value={item.url || ''}
                            onChange={(e) => updateItem(idx, 'url', e.target.value)}
                            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-primary/50 text-left ltr"
                            dir="ltr"
                        />
                    </div>
                    <button
                        onClick={() => removeItem(idx)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors self-end md:self-center"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            ))}
            <button
                onClick={addItem}
                className="w-full py-3 border border-dashed border-slate-700 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
            >
                <Plus size={16} />
                إضافة عنصر جديد
            </button>
        </div>
    )
}
