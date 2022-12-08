<template>
  <div>
    <h4 id='defaultresourceloader介绍'>DefaultResourceLoader介绍</h4>
    <p>DefaultResourceLoader是spring提供的一个默认的资源加载器，DefaultResourceLoader实现了ResourceLoader接口，提供了基本的资源加载能力。</p>
    <p>DefaultResourceLoader包含了一个protocolResolvers的set集，可以通过添加ProtocolResolver来提供不同协议资源的读取能力，默认情况下protocolResolvers是空的，我们可以通过添加ProtocolResolver扩展DefaultResourceLoader的能力。</p>
    <p>还有一点ProtocolResolver spring并没有提供他的实现类，所有一般情况下DefaultResourceLoader只能读取本机文件系统下的资源</p>
    <p>DefaultResourceLoader内部维护这一个ClassPathContextResource，一般情况都是new一个ClassPathContextResource返回</p>
    <h4 id='了解protocolresolver'>了解ProtocolResolver</h4>
    <p>ProtocolResolver是一个接口，实现该接口可以通过自定义不同的协议来读取解析资源路径中的资源。</p>
    <pre><code class='language-java' lang='java'>@FunctionalInterface
    public interface ProtocolResolver {

        /**
        * Resolve the given location against the given resource loader
        * if this implementation&#39;s protocol matches.
        * @param location the user-specified resource location
        * @param resourceLoader the associated resource loader
        * @return a corresponding {@code Resource} handle if the given location
        * matches this resolver&#39;s protocol, or {@code null} otherwise
        */
        @Nullable
        Resource resolve(String location, ResourceLoader resourceLoader);

    }
    </code></pre>
    <p>&nbsp;</p>
    <h4 id='defaultresourceloader源码'>DefaultResourceLoader源码</h4>
    <h5 id='defaultresourceloader内部的静态类'>DefaultResourceLoader内部的静态类</h5>
    <pre><code class='language-java' lang='java'>/**
        * ClassPathResource that explicitly expresses a context-relative path
        * through implementing the ContextResource interface.
        */
        protected static class ClassPathContextResource extends ClassPathResource implements ContextResource {

            public ClassPathContextResource(String path, @Nullable ClassLoader classLoader) {
                super(path, classLoader);
            }

            @Override
            public String getPathWithinContext() {
                return getPath();
            }

            @Override
            public Resource createRelative(String relativePath) {
                String pathToUse = StringUtils.applyRelativePath(getPath(), relativePath);
                return new ClassPathContextResource(pathToUse, getClassLoader());
            }
        }
    </code></pre>
    <p>&nbsp;</p>
    <h5 id='defaultresourceloader读取资源'>DefaultResourceLoader读取资源</h5>
    <p>DefaultResourceLoader读取资源先是用protocolResolver去解析，如果没有protocolResolver，就查看资源路径的格式。</p>
    <p>如果是ClassPath资源就new ClassPathResource();</p>
    <p>如果是“/”开始的new ClassPathContextResource(path, getClassLoader());</p>
    <p>如果是其他就参试new FileUrlResource(url)或者new UrlResource(url)</p>
    <pre><code class='language-java' lang='java'>@Override
        public Resource getResource(String location) {
            Assert.notNull(location, &quot;Location must not be null&quot;);
            //通过ProtocolResolver获取资源
            for (ProtocolResolver protocolResolver : getProtocolResolvers()) {
                Resource resource = protocolResolver.resolve(location, this);
                if (resource != null) {
                    return resource;
                }
            }
            //实际new ClassPathContextResource(path, getClassLoader());
            if (location.startsWith(&quot;/&quot;)) {
                return getResourceByPath(location);
            }//ClassPath资源
            else if (location.startsWith(CLASSPATH_URL_PREFIX)) {
                return new ClassPathResource(location.substring(CLASSPATH_URL_PREFIX.length()), getClassLoader());
            }//参试解读资源路径
            else {
                try {
                    // Try to parse the location as a URL...
                    URL url = new URL(location);
                    return (ResourceUtils.isFileURL(url) ? new FileUrlResource(url) : new UrlResource(url));
                }
                catch (MalformedURLException ex) {
                    // No URL -&gt; resolve as resource path.
                    return getResourceByPath(location);
                }
            }
        }
    </code></pre>
    <p>&nbsp;</p>
  </div>
</template>

<script>
export default {

}
</script>

<style>

</style>