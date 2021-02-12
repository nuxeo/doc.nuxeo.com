const { test } = require('tap');

const path = require('path');
const marked = require('marked');
const renderer = require('../modules/markdown_renderer');
const yaml_config = require('node-yaml-config');
// get config
const config = yaml_config.load(path.join(__dirname, '..', 'config.yml'));

const md_options = Object.assign(config.markdown_options, {
  renderer,
  highlight: (code) => require('highlight.js').highlightAuto(code).value,
});
marked.setOptions(md_options);

test('markdown_renderer is an object', (assert) => {
  // Get typeof string
  assert.isEqual(typeof renderer, 'object', 'renderer is an object');
  assert.end();
});

test('markdown_renderer converts text correctly', (assert) => {
  let test_cases = [];
  for (let i = 1; i <= 6; i++) {
    const heading_prefix = Array(i + 1).join('#');
    test_cases.push({
      message: `typography - heading ${i}`,
      preposition: `${heading_prefix} heading ${i}`,
      expected: `<h${i} id="heading-${i}"><a href="#heading-${i}" class="heading-anchor"><i class="fa fa-link"></i></a>heading ${i}</h${i}>`,
    });
  }

  test_cases = test_cases.concat([
    {
      message: 'typography - heading with ampersand',
      preposition: '## Heading & more',
      expected:
        '<h2 id="heading-and-more"><a href="#heading-and-more" class="heading-anchor"><i class="fa fa-link"></i></a>Heading &amp; more</h2>',
    },
    {
      message: 'typography - heading with anchor',
      preposition: "## Custom Anchor {{> anchor 'something-else'}}",
      expected:
        '<h2 id="custom-anchor"><a href="#custom-anchor" class="heading-anchor"><i class="fa fa-link"></i></a>Custom Anchor {{&gt; anchor &#39;something-else&#39;}}</h2>',
    },
    {
      message: 'typography - heading with link',
      preposition: '## [Link](/another/page/)',
      expected:
        '<h2 id="link"><a href="#link" class="heading-anchor"><i class="fa fa-link"></i></a><a href="/another/page/">Link</a></h2>',
    },
    {
      message: 'typography - heading with tags',
      preposition: "## Tagged {{> tag 'new'}}",
      expected:
        '<h2 id="tagged"><a href="#tagged" class="heading-anchor"><i class="fa fa-link"></i></a>Tagged {{&gt; tag &#39;new&#39;}}</h2>',
    },
    {
      message: 'typography - italic',
      preposition: 'this is _italic_',
      expected: '<p>this is <em>italic</em></p>',
    },
    {
      message: 'typography - bold',
      preposition: 'this is **bold**',
      expected: '<p>this is <strong>bold</strong></p>',
    },
    {
      message: 'typography - strikethrough',
      preposition: 'this is ~~strikethrough~~',
      expected: '<p>this is <del>strikethrough</del></p>',
    },
    {
      message: 'typography - smartypants',
      preposition: '"double quotes", \'single quotes\'',
      expected: '<p>&quot;double quotes&quot;, &#39;single quotes&#39;</p>',
    },
    {
      message: 'structure - horizontal rule',
      preposition: '---',
      expected: '<hr>',
    },
    // Un-reproducable behaviour on Jenkins
    // {
    //   message: 'link - auto-converted',
    //   preposition: 'go to www.nuxeo.com for more information',
    //   expected: '<p>go to <a href="http://www.nuxeo.com">www.nuxeo.com</a> for more information</p>'
    // },
    {
      message: 'link - normal',
      preposition: '[Nuxeo Blog](https://www.nuxeo.com/blog/)',
      expected:
        '<p><a href="https://www.nuxeo.com/blog/" target="_blank" rel="noopener">Nuxeo Blog</a></p>',
    },
    {
      message: 'link - reference',
      preposition:
        '[Nuxeo Platform][0]\n\n[0]: https://www.nuxeo.com/platform/',
      expected:
        '<p><a href="https://www.nuxeo.com/platform/" target="_blank" rel="noopener">Nuxeo Platform</a></p>',
    },
    {
      message: 'link - external with title',
      preposition: '[Nuxeo Events](/events/ ?external=true "Link Title")',
      expected:
        '<p><a href="/events/" title="Link Title" target="_blank" rel="noopener">Nuxeo Events</a></p>',
    },
    {
      message: 'image - normal',
      preposition: '![Example image](https://example.com/image.png)',
      expected:
        '<p><img alt="Example image" src="https://example.com/image.png"></p>',
    },
    // ?w=180,h=360,border=true,thumbnail=true,align=right "title"
    {
      message: 'image - border',
      preposition:
        '![Example image](https://example.com/image.png ?border=true "Image title")',
      expected:
        '<p><img alt="Example image" src="https://example.com/image.png" title="Image title" class="nuxeo border"></p>',
    },
    {
      message: 'image - width and height',
      preposition:
        '![Example image](https://example.com/image.png ?h=120,w=250 "Image title")',
      expected: `<p>
        <div class="large reveal" id="image_afc9bdb942aafe8db202dc7127fa35a1" data-reveal data-animation-in="fade-in" data-animation-out="fade-out">
        <img alt="Example image" src="https://example.com/image.png" title="Image title" >
        <button class="close-button" data-close aria-label="Close modal" type="button">
        <span aria-hidden="true">&times;</span>
        </button>
        </div>
        <div class="">
        <img alt="Example image" src="https://example.com/image.png" title="Image title" width="250" height="120" class="thumbnail" data-open="image_afc9bdb942aafe8db202dc7127fa35a1">
        </div></p>`,
    },
    {
      message: 'code block - syntax highlighting',
      preposition: '```\nsome text\nto display\n```',
      expected: `<pre><code><span class="hljs-keyword">some</span> <span class="hljs-built_in">text</span>
<span class="hljs-keyword">to</span> display
</code></pre>`,
    },
    {
      message: 'structure - blockquotes',
      preposition: `> Some quoted text
    >
    > Continued`,
      expected: `<blockquote>
<p>Some quoted text</p>
<p>Continued</p>
</blockquote>`,
    },
  ]);

  test_cases.forEach(({ message, preposition, expected }) => {
    assert.isEqual(marked(preposition).trim(), expected, message);
  });

  assert.end();
});
