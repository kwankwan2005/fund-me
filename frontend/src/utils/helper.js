export function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0
    }).format(amount)
}

export function formatDate(dateStr) {
    const d = new Date(dateStr)
    return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    })
}

export function formatDateTime(dateStr) {
    const d = new Date(dateStr)
    return d.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

export function generateAvatar(name) {
    return `https://testingbot.com/free-online-tools/random-avatar/200?name=${encodeURIComponent(name)}&size=200&backgroundColor=ffffff&textColor=000000`
}

export default {
    formatCurrency,
    formatDate,
    formatDateTime,
    generateAvatar
}