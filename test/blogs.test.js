const Page = require('./helpers/page');

let page; 

beforeEach(async() => {
    page = await Page.build();  // Our Proxy 
    await page.goto('localhost:3000');
});

afterEach(async () => {
    await page.close(); 
});

describe('When logged in', async () => {
    beforeEach( async () => {
        await page.login();
        await page.click('a.btn-floating');
    });

    test('Can see blog create form', async () => {
        const titleLabel = await page.getContentsOf('.title label');
        const contentLabel = await page.getContentsOf('.content label');
        expect(titleLabel).toEqual('Blog Title');
        expect(contentLabel).toEqual('Content'); 
    });

    describe('And using invalid inputs', async () => {
        beforeEach( async () => {
            await page.click('form button');
        });
        test('the form shows an error message', async () => {
            const titleError = await page.getContentsOf('.title .red-text');
            const contentError = await page.getContentsOf('.content .red-text');

            expect(titleError).toEqual('You must provide a value');
            expect(contentError).toEqual('You must provide a value');
        });
    });

    describe('And using valid inputs', async () => {
        beforeEach( async () => {
            await page.type('.title input', 'Test Title');
            await page.type('.content input', 'Test Content');
            await page.click('form button'); 
        });

        test('submitting takes user to review screen', async () => {
            const text = await page.getContentsOf('h5');
            expect(text).toEqual('Please confirm your entries'); 
        });
            
        test('saving adds blog to index page', async () => {
            await page.click('button.green');
            await page.waitFor('.card');  // let page render first 

            const title = await page.getContentsOf('.card-title');
            const content = await page.getContentsOf('p');

            expect(title).toEqual('Test Title'); 
            expect(content).toEqual('Test Content');
        });    
    });
});

describe('When NOT logged in', async () => {
    const actions = [
        {
            method: 'get',
            path: 'api/blogs',
        },
        {
            method: 'post',
            path: '/api/blogs',
            data: {
                title: 'Test Title',
                content: 'Test Content'
            }
        }
    ];
    test('Blog related actions are prohibited', async () => {
        const results = await page.execRequests(actions);
        for (let result of results) {
            expect(result).toEqual('You must log in!'); 
        }
    });
    // test('User cannot create blog posts', async () => {
    //     const data = {title: 'Test Title', content: 'Test Content'}
    //     const result = await page.post('/api/blogs', data);
    //     expect(result.error).toEqual('You must log in!'); 
    // });

    // test('User cannot see posted blogs', async () => {
    //     const result = await page.get('/api/blogs');
    //     expect(result.error).toEqual('You must log in!'); 
    // });
});
