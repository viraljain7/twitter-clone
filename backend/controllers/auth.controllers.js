const signup = async (req, res) => {
    res.json({ data: 'signup endpoint' });
}

const login = async (req, res) => {
    res.json({ data: 'login endpoint' });
}

const logout = async (req, res) => {
    res.json({ data: 'logout endpoint' });
}

export { signup, login, logout }