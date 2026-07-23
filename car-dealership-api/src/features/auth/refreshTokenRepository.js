class RefreshTokenRepository {
  constructor(refreshTokenModel) {
    this.RefreshToken = refreshTokenModel;
  }

  async create(tokenData) {
    return await this.RefreshToken.create(tokenData);
  }

  async findByToken(token) {
    return await this.RefreshToken.findOne({ where: { token } });
  }

  async revoke(tokenStr) {
    const tokenRecord = await this.findByToken(tokenStr);
    if (tokenRecord) {
      tokenRecord.is_revoked = true;
      await tokenRecord.save();
      return true;
    }
    return false;
  }
}

module.exports = { RefreshTokenRepository };
