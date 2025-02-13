export const calculateAdminMargin = (amount) => {
    if (amount <= 50000) return amount * 0.05; // 5%
    if (amount > 50000 && amount <= 500000) return amount * 0.1; // 10%
    if (amount > 500000 && amount <= 2000000) return amount * 0.12; // 12%
    return amount * 0.15; // 15% for amounts > ₹20000000
};
