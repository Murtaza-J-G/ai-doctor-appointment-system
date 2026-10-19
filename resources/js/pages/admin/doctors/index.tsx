import { Head, router, useForm } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Doctor } from '@/types/clinic';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Title } from '@radix-ui/react-dialog';

interface Props {
    doctors: Doctor[];
}

// Display order Mon..Sun; values match Carbon's dayOfWeek (0 = Sun).
const DAYS = [
    { value: 1, label: 'Mon' },
    { value: 2, label: 'Tue' },
    { value: 3, label: 'Wed' },
    { value: 4, label: 'Thu' },
    { value: 5, label: 'Fri' },
    { value: 6, label: 'Sat' },
    { value: 0, label: 'Sun' },
];

interface DayRow {
    day_of_week: number;
    enabled: boolean;
    start_time: string;
    end_time: string;
}

function buildDays(doctor?: Doctor | null): DayRow[] {
    return DAYS.map((day) => {
        const existing = doctor?.availabilities.find((a) => a.day_of_week === day.value);
        return {
            day_of_week: day.value,
            enabled: Boolean(existing),
            start_time: existing?.start_time?.slice(0, 5) ?? '09:00',
            end_time: existing?.end_time?.slice(0, 5) ?? '17:00',
        };
    });
}

function workingDaysLabel(doctor: Doctor): string {
    const labels = DAYS.filter((day) => doctor.availabilities.some((a) => a.day_of_week === day.value)).map((d) => d.label);
    return labels.length ? labels.join(', ') : '-';
}

export default function DoctorsIndex({ doctors } : Props){
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Doctor | null>(null);

    const form = useForm<{ name: string; specialty: string; bio: string; days: DayRow[] }>({
        name: '',
        specialty: '',
        bio: '',
        days: buildDays(null),
    });
 
    function openCreate() {
        setEditing(null);
        form.setData({ name: '', specialty: '', bio: '', days: buildDays(null) });
        form.clearErrors();
        setOpen(true);
    }

    function openEdit(doctor: Doctor) {
        setEditing(doctor);
        form.setData({
            name: doctor.name,
            specialty: doctor.specialty,
            bio: doctor.bio ?? '',
            days: buildDays(doctor),
        });
        form.clearErrors();
        setOpen(true);
    }

     function updateDay(index: number, patch: Partial<DayRow>) {
        form.setData(
            'days',
            form.data.days.map((day, i) => (i === index ? { ...day, ...patch } : day)),
        );
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();

        form.transform((data) => ({
            name: data.name,
            specialty: data.specialty,
            bio: data.bio,
            availabilities: data.days
                .filter((day) => day.enabled)
                .map(({ day_of_week, start_time, end_time }) => ({ day_of_week, start_time, end_time })),
        }));

        const options = {
            onSuccess: () => {
                toast.success(editing ? 'Doctor updated.' : 'Doctor added.');
                setOpen(false);
            },
        };

        if (editing) {
            form.put(`/admin/doctors/${editing.id}`, options);
        } else {
            form.post('/admin/doctors', options);
        }
    }

    function destroy(doctor: Doctor) {
        if (!confirm(`Delete ${doctor.name}? This also removes their appointments.`)) return;
        router.delete(`/admin/doctors/${doctor.id}`, {
            onSuccess: () => toast.success('Doctor removed.'),
        });
    }

    return (
        <>
            <Head title="Manage Doctors" />
            <div className="p-4">
            <div className="mb-4 flex items-center justify-between">
                <h1 className="text-xl font-semibold">Doctors</h1>
                <Button onClick={openCreate}>
                    <Plus className="mr-2 size-4" /> Add Doctor
                </Button>
            </div>
                <div className="overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-left">
                            <tr>
                                <th className="px-4 py-3">Name</th>
                                <th className="px-4 py-3">Specialty</th>
                                <th className="px-4 py-3">Working Days</th>
                                <th className="px-4 py-3">Actions</th> 
                            </tr>
                        </thead>
                        <tbody>
                            {doctors.length === 0 &&(
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                                        No doctors yet. Add one to get started.
                                    </td>
                                </tr>
                            )}

                            {doctors.map((doctor) => (
                                <tr key={doctor.id} className="border-t border-sidebar-border/70 dark:border-sidebar-border">
                                    <td className="px-4 py-3 font-medium">{doctor.name}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{doctor.specialty}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{workingDaysLabel(doctor)}</td>
                                    <td className="px-4 py-3 text-right">
                                        <Button variant="ghost" size="icon" onClick={() => openEdit(doctor)}>
                                            <Pencil className="size-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => destroy(doctor)}>
                                            <Trash2 className="size-4 text-destructive" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}

                        </tbody>
                    </table>
                </div>

            </div>

        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{editing ? 'Edit Doctor' : 'Add Doctor'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-1">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />
                        {form.errors.name && <p className="text-sm text-destructive">{form.errors.name}</p>}
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="specialty">Specialty</Label>
                        <Input id="specialty" value={form.data.specialty} onChange={(e) => form.setData('specialty', e.target.value)} />
                        {form.errors.specialty && <p className="text-sm text-destructive">{form.errors.specialty}</p>}
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="bio">Bio</Label>
                        <Input id="bio" value={form.data.bio} onChange={(e) => form.setData('bio', e.target.value)} />
                    </div>
                    
                    <div className="space-y-2">
                        <Label>Weekly availability</Label>
                        <div className="space-y-2">
                            {form.data.days.map((day, index) => (
                                <div key={day.day_of_week} className="flex items-center gap-3">
                                    <label className="flex w-20 items-center gap-2">
                                        <Checkbox
                                            checked={day.enabled}
                                            onCheckedChange={(checked) => updateDay(index, { enabled: Boolean(checked) })}
                                        />
                                        <span className="text-sm">{DAYS.find((d) => d.value === day.day_of_week)?.label}</span>
                                    </label>
                                    <Input
                                        type="time"
                                        value={day.start_time}
                                        disabled={!day.enabled}
                                        onChange={(e) => updateDay(index, { start_time: e.target.value })}
                                        className="w-32"
                                    />
                                    <span className="text-muted-foreground">to</span>
                                    <Input
                                        type="time"
                                        value={day.end_time}
                                        disabled={!day.enabled}
                                        onChange={(e) => updateDay(index, { end_time: e.target.value })}
                                        className="w-32"
                                    />
                                </div>
                            ))}

                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            {editing ? 'Save changes' : 'Add doctor'}
                        </Button>
                    </div>

                </form>
            </DialogContent>
        </Dialog>

        </>
    );

}

DoctorsIndex.layout = {
    Breadcrumbs: [{ title: 'Doctors', href: '/admin/doctors' }],
};