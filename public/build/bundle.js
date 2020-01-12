
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, value = ret) => {
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, detail));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    /* src/App.svelte generated by Svelte v3.16.7 */

    const file = "src/App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i].name;
    	child_ctx[4] = list[i].content;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i].name;
    	child_ctx[7] = list[i].url;
    	return child_ctx;
    }

    // (67:2) {#each info["photos"] as { name, url }}
    function create_each_block_1(ctx) {
    	let li;
    	let li_alt_value;

    	const block = {
    		c: function create() {
    			li = element("li");
    			set_style(li, "background-image", "url(" + /*url*/ ctx[7] + ")");
    			attr_dev(li, "alt", li_alt_value = /*name*/ ctx[2]);
    			attr_dev(li, "class", "svelte-1yullwf");
    			add_location(li, file, 67, 2, 2590);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(67:2) {#each info[\\\"photos\\\"] as { name, url }}",
    		ctx
    	});

    	return block;
    }

    // (74:2) {#each info["details"] as { name, content }}
    function create_each_block(ctx) {
    	let li;
    	let h3;
    	let t0_value = /*name*/ ctx[2] + "";
    	let t0;
    	let t1;
    	let p;
    	let t2_value = /*content*/ ctx[4] + "";
    	let t2;
    	let t3;

    	const block = {
    		c: function create() {
    			li = element("li");
    			h3 = element("h3");
    			t0 = text(t0_value);
    			t1 = space();
    			p = element("p");
    			t2 = text(t2_value);
    			t3 = space();
    			attr_dev(h3, "class", "svelte-1yullwf");
    			add_location(h3, file, 75, 3, 2747);
    			attr_dev(p, "class", "svelte-1yullwf");
    			add_location(p, file, 78, 3, 2775);
    			attr_dev(li, "class", "svelte-1yullwf");
    			add_location(li, file, 74, 2, 2739);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, h3);
    			append_dev(h3, t0);
    			append_dev(li, t1);
    			append_dev(li, p);
    			append_dev(p, t2);
    			append_dev(li, t3);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(74:2) {#each info[\\\"details\\\"] as { name, content }}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let meta0;
    	let meta1;
    	let meta2;
    	let meta3;
    	let meta4;
    	let meta5;
    	let meta6;
    	let meta7;
    	let meta8;
    	let meta9;
    	let t0;
    	let div1;
    	let div0;
    	let h2;
    	let t1;
    	let br;
    	let t2;
    	let t3;
    	let a0;
    	let t5;
    	let div2;
    	let h1;
    	let t7;
    	let p;
    	let t9;
    	let ul0;
    	let t10;
    	let ul1;
    	let t11;
    	let a1;
    	let each_value_1 = /*info*/ ctx[1]["photos"];
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = /*info*/ ctx[1]["details"];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			meta0 = element("meta");
    			meta1 = element("meta");
    			meta2 = element("meta");
    			meta3 = element("meta");
    			meta4 = element("meta");
    			meta5 = element("meta");
    			meta6 = element("meta");
    			meta7 = element("meta");
    			meta8 = element("meta");
    			meta9 = element("meta");
    			t0 = space();
    			div1 = element("div");
    			div0 = element("div");
    			h2 = element("h2");
    			t1 = text("함께 찬양하길");
    			br = element("br");
    			t2 = text("원하시나요?");
    			t3 = space();
    			a0 = element("a");
    			a0.textContent = "글로리파이 지원하기";
    			t5 = space();
    			div2 = element("div");
    			h1 = element("h1");
    			h1.textContent = `${/*info*/ ctx[1]["title"]}`;
    			t7 = space();
    			p = element("p");
    			p.textContent = `${/*info*/ ctx[1]["description"]}`;
    			t9 = space();
    			ul0 = element("ul");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t10 = space();
    			ul1 = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t11 = space();
    			a1 = element("a");
    			a1.textContent = "글로리파이 지원하기";
    			attr_dev(meta0, "charset", "UTF-8");
    			add_location(meta0, file, 37, 4, 1332);
    			attr_dev(meta1, "name", "viewport");
    			attr_dev(meta1, "content", "width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no");
    			add_location(meta1, file, 38, 4, 1359);
    			attr_dev(meta2, "name", "title");
    			attr_dev(meta2, "content", "SNS Glorify Choir");
    			add_location(meta2, file, 39, 4, 1490);
    			attr_dev(meta3, "name", "description");
    			attr_dev(meta3, "content", "온누리교회 청년부 SNS 공동체 글로리파이팀에서 여러분을 환영합니다.");
    			add_location(meta3, file, 40, 4, 1542);
    			attr_dev(meta4, "name", "keywords");
    			attr_dev(meta4, "content", "onnuri, sns, 온누리교회, 온누리, 특순콰이어, 콰이어, 성가대, 4중창");
    			add_location(meta4, file, 41, 4, 1621);
    			attr_dev(meta5, "name", "author");
    			attr_dev(meta5, "content", "Seongsoo Lim");
    			add_location(meta5, file, 42, 4, 1704);
    			attr_dev(meta6, "property", "og:title");
    			attr_dev(meta6, "content", "SNS Glorify Choir");
    			add_location(meta6, file, 43, 4, 1752);
    			attr_dev(meta7, "property", "og:description");
    			attr_dev(meta7, "content", "온누리교회 청년부 SNS 공동체 글로리파이팀에서 여러분을 환영합니다.");
    			add_location(meta7, file, 44, 4, 1812);
    			attr_dev(meta8, "property", "og:type");
    			attr_dev(meta8, "content", "article");
    			add_location(meta8, file, 45, 4, 1899);
    			attr_dev(meta9, "property", "og:image");
    			attr_dev(meta9, "content", "https://firebasestorage.googleapis.com/v0/b/sns-glorify.appspot.com/o/glory-2019-2.jpeg?alt=media&token=6a9a0860-2fb4-4507-9db8-397cd6d2b143");
    			add_location(meta9, file, 46, 4, 1948);
    			document.title = "SNS Glorify Choir";
    			add_location(br, file, 53, 15, 2292);
    			attr_dev(h2, "class", "svelte-1yullwf");
    			add_location(h2, file, 52, 2, 2272);
    			attr_dev(a0, "target", "_blank");
    			attr_dev(a0, "href", "https://thinkbetter.typeform.com/to/QsHEm4");
    			attr_dev(a0, "class", "svelte-1yullwf");
    			add_location(a0, file, 55, 4, 2315);
    			attr_dev(div0, "class", "wrapper svelte-1yullwf");
    			add_location(div0, file, 51, 1, 2248);
    			attr_dev(div1, "class", "cover-img svelte-1yullwf");
    			set_style(div1, "background-image", "url(" + /*imgUrl*/ ctx[0] + ")");
    			add_location(div1, file, 50, 0, 2183);
    			attr_dev(h1, "class", "svelte-1yullwf");
    			add_location(h1, file, 59, 1, 2446);
    			attr_dev(p, "class", "about svelte-1yullwf");
    			add_location(p, file, 62, 1, 2477);
    			attr_dev(ul0, "class", "photos svelte-1yullwf");
    			add_location(ul0, file, 65, 1, 2526);
    			attr_dev(ul1, "class", "details svelte-1yullwf");
    			add_location(ul1, file, 72, 1, 2669);
    			attr_dev(a1, "target", "_blank");
    			attr_dev(a1, "href", "https://thinkbetter.typeform.com/to/QsHEm4");
    			attr_dev(a1, "class", "btn-apply svelte-1yullwf");
    			add_location(a1, file, 84, 1, 2827);
    			attr_dev(div2, "class", "wrapper contents svelte-1yullwf");
    			add_location(div2, file, 58, 0, 2414);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, meta0);
    			append_dev(document.head, meta1);
    			append_dev(document.head, meta2);
    			append_dev(document.head, meta3);
    			append_dev(document.head, meta4);
    			append_dev(document.head, meta5);
    			append_dev(document.head, meta6);
    			append_dev(document.head, meta7);
    			append_dev(document.head, meta8);
    			append_dev(document.head, meta9);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, h2);
    			append_dev(h2, t1);
    			append_dev(h2, br);
    			append_dev(h2, t2);
    			append_dev(div0, t3);
    			append_dev(div0, a0);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, h1);
    			append_dev(div2, t7);
    			append_dev(div2, p);
    			append_dev(div2, t9);
    			append_dev(div2, ul0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(ul0, null);
    			}

    			append_dev(div2, t10);
    			append_dev(div2, ul1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul1, null);
    			}

    			append_dev(div2, t11);
    			append_dev(div2, a1);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*info*/ 2) {
    				each_value_1 = /*info*/ ctx[1]["photos"];
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(ul0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*info*/ 2) {
    				each_value = /*info*/ ctx[1]["details"];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			detach_dev(meta0);
    			detach_dev(meta1);
    			detach_dev(meta2);
    			detach_dev(meta3);
    			detach_dev(meta4);
    			detach_dev(meta5);
    			detach_dev(meta6);
    			detach_dev(meta7);
    			detach_dev(meta8);
    			detach_dev(meta9);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self) {
    	let name = "world";
    	let imgUrl = "images/cover2.jpeg";

    	let teams = {
    		"Glorify": {
    			"cover_img": ["images/cover1.jpeg", "images/cover2.jpeg", "images/cover3.jpeg"],
    			"title": "하나님을 뜨겁게 찬양하는 Glorify",
    			"description": "찬양을 사모하는 청년들이 모여 함께 연습하고 교제하며 받은 은혜를 하나님께 찬양드립니다.",
    			"photos": [
    				{
    					name: "glorify-2017-01",
    					url: "images/glory-2017-1.jpeg"
    				},
    				{
    					name: "glorify-2017-01",
    					url: "images/glory-2017-2.jpeg"
    				},
    				{
    					name: "glorify-2017-01",
    					url: "images/glory-2019-1.jpeg"
    				},
    				{
    					name: "glorify-2017-01",
    					url: "images/glory-2019-2.jpeg"
    				},
    				{
    					name: "glorify-2017-01",
    					url: "images/glory-2019-3.jpeg"
    				},
    				{
    					name: "glorify-2017-01",
    					url: "images/glory-2019-5.jpeg"
    				}
    			],
    			"details": [
    				{
    					name: "Activity",
    					content: "비전헌금특순, 특별예배섬김"
    				},
    				{
    					name: "Recruting",
    					content: "하나님을 성실하게 찬양드릴 분, 찬양에 은사 있는분, 소프라노, 알토, 베이스, 테너"
    				},
    				{
    					name: "Time",
    					content: "주일 순모임 이후 8시~9시 30분"
    				},
    				{ name: "Location", content: "시온홀" },
    				{ name: "Contact", content: "오준석 팀" },
    				{
    					name: "Prayer Request",
    					content: "Glorify가 찬양을 사모하는 100명의  찬양대가 되어서 단에서 하나님께 최고의 찬양을 드릴수있도록."
    				}
    			],
    			"videos": [
    				{
    					name: "BABA YETU",
    					url: "https://www.youtube.com/watch?v=7irYR9YLduc",
    					yid: "7irYR9YLduc"
    				},
    				{
    					name: "축복하노라",
    					url: "https://youtu.be/UBKuoI0ozf8",
    					yid: "7irYR9YLduc"
    				}
    			]
    		}
    	};

    	let info = teams["Glorify"];

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("name" in $$props) $$invalidate(2, name = $$props.name);
    		if ("imgUrl" in $$props) $$invalidate(0, imgUrl = $$props.imgUrl);
    		if ("teams" in $$props) teams = $$props.teams;
    		if ("info" in $$props) $$invalidate(1, info = $$props.info);
    	};

    	return [imgUrl, info, name];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
