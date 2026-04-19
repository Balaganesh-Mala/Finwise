import os

filepath = 'd:/Projects/Finwise/admin/src/pages/FeeManagement.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Imports
if 'EditInstallmentModal' not in content:
    content = content.replace(
        "import ReceiptModal from '../components/ReceiptModal';",
        "import ReceiptModal from '../components/ReceiptModal';\nimport EditInstallmentModal from '../components/EditInstallmentModal';\nimport AddCustomInstallmentModal from '../components/AddCustomInstallmentModal';"
    )

# 2. State
state_injection = """    const [editInstallmentData, setEditInstallmentData] = useState(null);
    const [addCustomStudent, setAddCustomStudent] = useState(null);"""

if 'editInstallmentData' not in content:
    content = content.replace(
        "const [recordingPayment, setRecordingPayment] = useState(false);",
        f"const [recordingPayment, setRecordingPayment] = useState(false);\n{state_injection}"
    )

# 3. Actions Column - Add Editing and Adding
# Find the exact Actions block:
old_actions = """                                                    <>
                                                        <button
                                                            onClick={() => handleSendReminder(inst._id)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors tooltip-trigger border border-transparent hover:border-blue-100"
                                                            title="Send Reminder"
                                                        >
                                                            <Mail size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteInstallment(inst._id)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors tooltip-trigger border border-transparent hover:border-red-100"
                                                            title="Delete Installment"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => setPaymentModalData(inst)}
                                                            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
                                                        >
                                                            <CheckCircle size={14} /> Mark Paid
                                                        </button>
                                                    </>"""

import re
if 'setEditInstallmentData' not in content and 'Mail size={16}' in content:
    new_actions = """                                                    <>
                                                        <button
                                                            onClick={() => setAddCustomStudent({ studentId: inst.student_id?._id, feeId: inst.fee_structure_id })}
                                                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors tooltip-trigger border border-transparent hover:border-emerald-100"
                                                            title="Add Custom Installment to this Student"
                                                        >
                                                            <Plus size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => setEditInstallmentData(inst)}
                                                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors tooltip-trigger border border-transparent hover:border-indigo-100"
                                                            title="Edit Installment Amount / Date"
                                                        >
                                                            <div className="w-4 h-4 flex items-center justify-center font-serif italic font-bold">E</div>
                                                        </button>
                                                        <button
                                                            onClick={() => handleSendReminder(inst._id)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors tooltip-trigger border border-transparent hover:border-blue-100"
                                                            title="Send Reminder"
                                                        >
                                                            <Mail size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteInstallment(inst._id)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors tooltip-trigger border border-transparent hover:border-red-100"
                                                            title="Delete Installment"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => setPaymentModalData(inst)}
                                                            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium rounded-lg transition-colors shadow-sm flex items-center gap-1.5 ml-1"
                                                        >
                                                            <CheckCircle size={14} /> Mark Paid
                                                        </button>
                                                    </>"""
    # Quick replace
    content = content.replace(old_actions, new_actions)


# 4. Modals at the bottom
if 'EditInstallmentModal' not in content.split('return (')[1]:
    modals = """
            <EditInstallmentModal
                isOpen={!!editInstallmentData}
                onClose={() => setEditInstallmentData(null)}
                onSuccess={fetchInstallments}
                installment={editInstallmentData}
            />

            <AddCustomInstallmentModal
                isOpen={!!addCustomStudent}
                onClose={() => setAddCustomStudent(null)}
                onSuccess={fetchInstallments}
                preselectedStudentId={addCustomStudent?.studentId}
                feeStructureId={addCustomStudent?.feeId}
            />
    """
    content = content.replace("</AddFeeStructureModal>", "</AddFeeStructureModal>" + modals)
    # Actually wait, there is no </AddFeeStructureModal>. Let's inject before the final </div> tag.
    
    # Just replace  
    #            <MarkPaidModal
    # ...
    #            />
    #        </div>
    
    
    content = re.sub(r'(<MarkPaidModal.*?\n\s*/>)', r'\1\n' + modals, content, flags=re.DOTALL)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("FeeManagement.jsx updated")
