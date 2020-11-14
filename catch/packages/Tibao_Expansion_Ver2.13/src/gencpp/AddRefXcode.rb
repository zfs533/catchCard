require 'xcodeproj'
require 'find'

def add_file_to_group(target, project, directory_path, to_group, need_mrc)
    puts "execute add_file_to_group"
    if to_group and File::exist?(directory_path) then
        Dir.foreach(directory_path) do |entry|
            if entry != "." and entry != ".." and entry != ".DS_Store" and entry != "api"
                pb_gen_file_path = entry
                if to_group.find_file_by_path(pb_gen_file_path)
                    puts pb_gen_file_path + " reference exist"
                else
                    file_reference = to_group.new_reference(pb_gen_file_path)
                    if need_mrc and entry.include?("pbobjc.m")
                        target.add_file_references([file_reference],'-fno-objc-arc')
                    else
                        target.add_file_references([file_reference])
                    end
                end
            end
        end
        project.save
    end
end


# xcode 文件路径
xcodeprojpath   = ARGV[0]
# 要添加的文件夹
addfilespath    = ARGV[1]
# 添加到xcode中组的名字
grouppathname   = ARGV[2]

project     = Xcodeproj::Project.open(xcodeprojpath)
target      = project.targets.first

puts grouppathname
if project.targets.length > 1 then
    puts "there more targer here"
    target = project.targets.at(1)
end

group = project.main_group.find_subpath(grouppathname)
if group.nil? then
    puts "group is not exist, create it"
    puts grouppathname
    group = project.main_group.new_group(grouppathname, addfilespath, 'SOURCE_ROOT')
else
    puts "group is exist"
    # group.set_source_tree('SOURCE_ROOT')
end

add_file_to_group(target, project, addfilespath, group, true)
