import os
import re

filepath = 'd:/Projects/Finwise/admin/src/components/MarkPaidModal.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the state and submit handler
old_top = """export default function MarkPaidModal({ isOpen, onClose, onConfirm, installment, loading }) {
    const [paymentMode, setPaymentMode] = useState('Cash');
    const [referenceId, setReferenceId] = useState('');

    if (!isOpen || !installment) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirm({
            payment_mode: paymentMode,
            reference_id: referenceId,
            paid_amount: installment.amount
        });
    };"""

new_top = """export default function MarkPaidModal({ isOpen, onClose, onConfirm, installment, loading }) {
    const [paymentMode, setPaymentMode] = useState('Cash');
    const [referenceId, setReferenceId] = useState('');
    const [customAmount, setCustomAmount] = useState('');

    React.useEffect(() => {
        if (installment) {
            setCustomAmount(installment.amount);
            setPaymentMode('Cash');
            setReferenceId('');
        }
    }, [installment]);

    if (!isOpen || !installment) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirm({
            payment_mode: paymentMode,
            reference_id: referenceId,
            paid_amount: Number(customAmount) || installment.amount
        });
    };"""

content = content.replace(old_top, new_top)

# Find where to inject the custom amount field
# Right after:
# <div className="flex items-center gap-0.5 font-bold text-blue-700 text-sm">
#     <IndianRupee size={12} />
#     {installment.amount.toLocaleString()}
# </div>
# </div>
# We should add the custom amount input. Better yet, we can replace the layout below the header.

old_summary = """                    <div className="flex items-center justify-between p-2.5 bg-blue-50/50 rounded-lg border border-blue-100/50 text-xs">
                        <div className="flex flex-col">
                            <span className="text-gray-500 font-medium">#{installment.installment_no} • {installment.student_id?.name}</span>
                        </div>
                        <div className="flex items-center gap-0.5 font-bold text-blue-700 text-sm">
                            <IndianRupee size={12} />
                            {installment.amount.toLocaleString()}
                        </div>
                    </div>"""

new_summary = """                    <div className="flex items-center justify-between p-2.5 bg-blue-50/50 rounded-lg border border-blue-100/50 text-xs">
                        <div className="flex flex-col">
                            <span className="text-gray-500 font-medium">#{installment.installment_no} • {installment.student_id?.name}</span>
                        </div>
                        <div className="flex items-center gap-0.5 font-bold text-blue-700 text-sm">
                            <IndianRupee size={12} />
                            {installment.amount.toLocaleString()}
                        </div>
                    </div>

                    <div className="space-y-1.5 animate-in slide-in-from-top-1 duration-200">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex justify-between">
                            <span>Actual Amount Paid</span>
                            {Number(customAmount) !== installment.amount && (
                                <span className="text-amber-600 font-normal normal-case">Overrides original</span>
                            )}
                        </label>
                        <div className="relative">
                            <IndianRupee size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="number"
                                required
                                min="0"
                                value={customAmount}
                                onChange={(e) => setCustomAmount(e.target.value)}
                                className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-semibold"
                            />
                        </div>
                        {Number(customAmount) !== installment.amount && Number(customAmount) > 0 && (
                            <p className="text-[10px] text-amber-600 leading-tight">
                                This will permanently adjust this installment to ₹{Number(customAmount).toLocaleString()}. Please manually create a new installment for the deficit.
                            </p>
                        )}
                    </div>"""

content = content.replace(old_summary, new_summary)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("MarkPaidModal updated")
