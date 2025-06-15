const checkOwner = (resourceUserId, currentUserId) => {
    return resourceUserId === currentUserId;
};

module.exports = { checkOwner };
