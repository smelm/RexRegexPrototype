

foreach my $line (<STDIN>) {
    chomp($line);
    my @segments = split("SEP", $line);
    my $pattern = $segments[0];
    my $input = $segments[1];

    if($input =~ m/$pattern/g){
        print 1;
    } else {
        print 0;
    }
}
