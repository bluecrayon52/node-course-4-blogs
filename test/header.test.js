const Page = require('./helpers/page');

let page; 

beforeEach(async() => {
    page = await Page.build();  // Our Proxy 
    await page.goto('http://localhost:3000');
});

afterEach(async () => {
    await page.close(); 
});


test('The header has the correct text', async () => {
    // nothing special about $ sign 
    const text = await page.getContentsOf('a.brand-logo'); 

    expect(text).toEqual('Blogster'); 
}); 

test('clicking login starts oauth flow', async () => {
    await page.click('.right a');
    const url = await page.url(); 
    expect(url).toMatch(/accounts\.google\.com/);
});

test('When signed in, shows logout button', async () => {
    await page.login();
    const text = await page.getContentsOf('a[href="/auth/logout"]');
    expect(text).toEqual('Logout'); 
});
