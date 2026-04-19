import os

filepath = 'd:/Projects/Finwise/admin/src/pages/Inquiries.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

handler_injection = """    const handleRemarksUpdate = async (id, newRemarks) => {
        try {
            const res = await axios.patch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/inquiries/${id}`, { remarks: newRemarks });
            setInquiries(inquiries.map(item => item._id === id ? res.data : item));
            toast.success('Remarks saved automatically', { position: 'bottom-right' });
        } catch (err) {
            console.error('Error saving remarks:', err);
            toast.error('Failed to save remarks');
        }
    };

    const handleStatusUpdate = async"""

content = content.replace("    const handleStatusUpdate = async", handler_injection)

# Add Table Header
old_header = """                                <th className="p-4">Contact Info</th>
                                <th className="p-4">Interest / Message</th>
                                <th className="p-4">Source</th>"""

new_header = """                                <th className="p-4">Contact Info</th>
                                <th className="p-4">Interest / Message</th>
                                <th className="p-4 w-48">Admin Remarks</th>
                                <th className="p-4">Source</th>"""

content = content.replace(old_header, new_header)


# Add Table Data
old_td = """                                                <p className="text-gray-600 truncate group-hover:whitespace-normal group-hover:overflow-visible group-hover:bg-white group-hover:z-10 group-hover:absolute group-hover:shadow-lg group-hover:p-4 group-hover:rounded-lg group-hover:border group-hover:border-gray-100 group-hover:w-80">
                                                    {inquiry.message}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="p-4 align-top">
                                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${inquiry.source === 'quote_popup' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}`}>"""

new_td = """                                                <p className="text-gray-600 truncate group-hover:whitespace-normal group-hover:overflow-visible group-hover:bg-white group-hover:z-10 group-hover:absolute group-hover:shadow-lg group-hover:p-4 group-hover:rounded-lg group-hover:border group-hover:border-gray-100 group-hover:w-80">
                                                    {inquiry.message}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="p-4 align-top">
                                            <textarea 
                                                className="w-full text-xs p-2 border border-gray-200 rounded min-h-[60px] bg-yellow-50 focus:bg-white transition-colors focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-y" 
                                                placeholder="Add notes..."
                                                defaultValue={inquiry.remarks || ''}
                                                onBlur={(e) => {
                                                    if(e.target.value !== (inquiry.remarks || '')) {
                                                        handleRemarksUpdate(inquiry._id, e.target.value);
                                                    }
                                                }}
                                            />
                                        </td>
                                        <td className="p-4 align-top">
                                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${inquiry.source === 'quote_popup' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}`}>"""

content = content.replace(old_td, new_td)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated Inquiries.jsx')
