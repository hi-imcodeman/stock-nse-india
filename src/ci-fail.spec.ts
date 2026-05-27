describe('CI failure trigger', () => {
    test('intentionally fails to verify Slack failed notification', () => {
        expect(true).toBe(false)
    })
})
